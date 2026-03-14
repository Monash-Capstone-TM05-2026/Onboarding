package com.onboarding.demo.service.impl;

import cn.hutool.core.date.DateUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.onboarding.demo.entity.AirQualityAdviceRule;
import com.onboarding.demo.entity.AirQualityData;
import com.onboarding.demo.entity.OpenDosmMonthlyData;
import com.onboarding.demo.mapper.AirQualityAdviceRuleMapper;
import com.onboarding.demo.mapper.AirQualityDataMapper;
import com.onboarding.demo.mapper.OpenDosmMonthlyDataMapper;
import com.onboarding.demo.service.AirQualityService;
import com.onboarding.demo.vo.DashboardVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class AirQualityServiceImpl implements AirQualityService {

    private final AirQualityDataMapper dataMapper;
    private final AirQualityAdviceRuleMapper ruleMapper;
    private final OpenDosmMonthlyDataMapper dosmMapper;

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

        // 5. 组装 VO 返回前端
        return DashboardVO.builder()
                .currentApi(currentData != null ? currentData.getApiValue() : 0)
                .currentColor(currentRule != null ? currentRule.getColorCode() : "#bdc3c7")
                .currentAdvice(currentRule != null ? currentRule.getAdviceText() : "暂无数据")
                .tomorrowApi(tomorrowData != null ? tomorrowData.getApiValue() : 0)
                .tomorrowColor(tomorrowRule != null ? tomorrowRule.getColorCode() : "#bdc3c7")
                .tomorrowAdvice(tomorrowRule != null ? tomorrowRule.getAdviceText() : "暂无预测")
                .historicalInsight(insight)
                .build();
    }

    // 辅助方法：根据 API 值匹配规则
    private AirQualityAdviceRule matchRule(Integer apiValue) {
        if (apiValue == null) return null;
        BigDecimal api = new BigDecimal(apiValue);
        return ruleMapper.selectOne(new LambdaQueryWrapper<AirQualityAdviceRule>()
                .eq(AirQualityAdviceRule::getIndicatorType, "API")
                .le(AirQualityAdviceRule::getMinVal, api)
                .ge(AirQualityAdviceRule::getMaxVal, api)
                .last("LIMIT 1"));
    }
}