package com.onboarding.demo.service.impl;

import cn.hutool.core.date.DateUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.onboarding.demo.bo.AqiLevel;
import com.onboarding.demo.entity.AirQualityAdviceRule;
import com.onboarding.demo.entity.AirQualityData;
import com.onboarding.demo.entity.OpenDosmMonthlyData;
import com.onboarding.demo.mapper.AirQualityAdviceRuleMapper;
import com.onboarding.demo.mapper.AirQualityDataMapper;
import com.onboarding.demo.mapper.OpenDosmMonthlyDataMapper;
import com.onboarding.demo.service.AirQualityService;
import com.onboarding.demo.vo.DashboardVO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AirQualityServiceImpl implements AirQualityService {

    private final AirQualityDataMapper dataMapper;
    private final AirQualityAdviceRuleMapper ruleMapper;
    private final OpenDosmMonthlyDataMapper dosmMapper;

    private final RestTemplate restTemplate;

    private final ObjectMapper objectMapper;

    @Value("${waqi.api.url}")
    private String apiUrl;

    @Value("${waqi.api.token}")
    private String apiToken;

    @Override
    public DashboardVO getElderlyDashboard(Long locationId) {

        // 1. 获取最新实时数据 (is_forecast = 0)
        AirQualityData currentData = dataMapper.selectOne(new LambdaQueryWrapper<AirQualityData>()
                .eq(AirQualityData::getLocationId, locationId)
                .eq(AirQualityData::getIsForecast, 0)
                .orderByDesc(AirQualityData::getRecordTime)
                .last("LIMIT 1"));

        // 2. 获取明日预测数据 (is_forecast = 1)
        AirQualityData tomorrowData = dataMapper.selectOne(new LambdaQueryWrapper<AirQualityData>()
                .eq(AirQualityData::getLocationId, locationId)
                .eq(AirQualityData::getIsForecast, 1)
                // 现实中这里应该按明日早晨的时间过滤，MVP期间简单取一条预测即可
                .last("LIMIT 1"));

        // 3. 匹配健康建议字典
        AirQualityAdviceRule currentRule = matchRule(currentData != null ? currentData.getApiValue() : 0);
        AirQualityAdviceRule tomorrowRule = matchRule(tomorrowData != null ? tomorrowData.getApiValue() : 0);

        // 4. 获取历史趋势 (去年同月的 PM2.5)
        LocalDate lastYearSameMonth = LocalDate.now().minusYears(1).withDayOfMonth(1);
        OpenDosmMonthlyData historicalData = dosmMapper.selectOne(new LambdaQueryWrapper<OpenDosmMonthlyData>()
                .eq(OpenDosmMonthlyData::getLocationId, locationId)
                .eq(OpenDosmMonthlyData::getPollutant, "PM₂.₅")
                .eq(OpenDosmMonthlyData::getRecordDate, lastYearSameMonth)
                .last("LIMIT 1"));

        String insight = historicalData != null ?
                String.format("💡 季节提醒：根据 OpenDOSM 数据，去年同期本地区 PM₂.₅ 平均浓度为 %s µg/m³，请注意防范。", historicalData.getConcentration()) :
                "💡 季节提醒：近期请注意天气变化，出门备好口罩。";

        // 5. Assemble the VO and return to the front end
        return DashboardVO.builder()
                .currentAqi(currentData != null ? currentData.getApiValue() : 0)
                .currentColor(currentRule != null ? currentRule.getColorCode() : "#bdc3c7")
                .currentAdvice(currentRule != null ? currentRule.getAdviceText() : "暂无数据")
                .tomorrowAqi(tomorrowData != null ? tomorrowData.getApiValue() : 0)
                .tomorrowColor(tomorrowRule != null ? tomorrowRule.getColorCode() : "#bdc3c7")
                .tomorrowAdvice(tomorrowRule != null ? tomorrowRule.getAdviceText() : "暂无预测")
                .historicalInsight(insight)
                .build();
    }

    @Override
    public DashboardVO getCityAirQuality(String city) {
        // If no parameters are passed, the default setting is here (to get the current location).
        String targetCity = StringUtils.hasText(city) ? city : "here";

        String requestUrl = String.format(apiUrl, targetCity, apiToken);
        DashboardVO dashboardVO = new DashboardVO();

        try {
            String responseJson = restTemplate.getForObject(requestUrl, String.class);
            JsonNode rootNode = objectMapper.readTree(responseJson);

            if (!"ok".equals(rootNode.path("status").asText())) {
                throw new RuntimeException("Failed to fetch air quality data: " + rootNode.path("data").asText());
            }

            JsonNode dataNode = rootNode.path("data");
            // Analyze the current AQI
            int currentAqi = dataNode.path("aqi").asInt();
            dashboardVO.setCurrentAqi(currentAqi);
            AqiLevel currentLevel = evaluateAqi(currentAqi, false);
            dashboardVO.setCurrentColor(currentLevel.getColor());
            dashboardVO.setCurrentAdvice(currentLevel.getAdvice());

            // 3. Analyze the predicted AQI for tomorrow (taking the max value of the PM2.5 prediction data as a reference)
            int tomorrowAqi = currentAqi; // Use the current AQI as a safety net
            String tomorrowDate = LocalDate.now().plusDays(1).toString();
            JsonNode pm25ForecastArray = dataNode.path("forecast").path("daily").path("pm25");

            if (pm25ForecastArray.isArray()) {
                for (JsonNode node : pm25ForecastArray) {
                    if (tomorrowDate.equals(node.path("day").asText())) {
                        tomorrowAqi = node.path("max").asInt();
                        break;
                    }
                }
            }

            dashboardVO.setTomorrowAqi(tomorrowAqi);
            AqiLevel tomorrowLevel = evaluateAqi(tomorrowAqi, true);
            dashboardVO.setTomorrowColor(tomorrowLevel.getColor());
            dashboardVO.setTomorrowAdvice(tomorrowLevel.getAdvice());

            // current city
            dashboardVO.setCurrentCity(dataNode.path("city").path("name").asText());
            // Extract the s field from the time object under the data node
            String lastUpdatedTime = dataNode.path("time").path("s").asText();
            dashboardVO.setLastUpdated(lastUpdatedTime);

        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }
        return dashboardVO;
    }

    @Override
    public List<OpenDosmMonthlyData> getMonthlyDataByLocationId(Long locationId) {
        LambdaQueryWrapper<OpenDosmMonthlyData> queryWrapper = new LambdaQueryWrapper<OpenDosmMonthlyData>()
                .eq(OpenDosmMonthlyData::getLocationId, locationId)
                .eq(OpenDosmMonthlyData::getIsDeleted, 0)
                .orderByAsc(OpenDosmMonthlyData::getRecordDate);

        return dosmMapper.selectList(queryWrapper);
    }

    private AirQualityAdviceRule matchRule(Integer apiValue) {
        if (apiValue == null) return null;
        BigDecimal api = new BigDecimal(apiValue);
        return ruleMapper.selectOne(new LambdaQueryWrapper<AirQualityAdviceRule>()
                .eq(AirQualityAdviceRule::getIndicatorType, "API")
                .le(AirQualityAdviceRule::getMinVal, api)
                .ge(AirQualityAdviceRule::getMaxVal, api)
                .last("LIMIT 1"));
    }

    private AqiLevel evaluateAqi(int aqi, boolean isTomorrow) {
        if (aqi <= 50) {
            return new AqiLevel("Green",
                    isTomorrow ? "Clear skies and fresh air expected tomorrow" : "Atmosphere is serene and safe for outdoor leisure");
        } else if (aqi <= 100) {
            return new AqiLevel("Yellow",
                    isTomorrow ? "Moderate conditions expected, consider indoor plans" : "Ambient air is moderate, mindful activity recommended");
        } else if (aqi <= 150) {
            return new AqiLevel("Orange",
                    isTomorrow ? "Unhealthy conditions expected, stay indoors if possible" : "Caution: Atmospheric quality is currently compromised");
        } else {
            return new AqiLevel("Maroon",
                    isTomorrow ? "Hazardous conditions expected, avoid outdoor activities" : "Hazardous air quality — avoid outdoor exposure");
        }
    }
}