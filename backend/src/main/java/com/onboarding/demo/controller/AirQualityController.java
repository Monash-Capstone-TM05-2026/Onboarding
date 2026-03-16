package com.onboarding.demo.controller;

import com.onboarding.demo.entity.Location;
import com.onboarding.demo.entity.OpenDosmMonthlyData;
import com.onboarding.demo.mapper.LocationMapper;
import com.onboarding.demo.service.AirQualityService;
import com.onboarding.demo.vo.DashboardVO;
import com.onboarding.demo.vo.LocationVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/air-quality")
@RequiredArgsConstructor
@Tag(name = "Air quality dashboard interface", description = "Minimalist Kanban data provided for the front end of the elderly")
// Solve cross-domain issues and facilitate local front-end debugging
@CrossOrigin(origins = "*")
public class AirQualityController {

    private final AirQualityService airQualityService;

    private final LocationMapper locationMapper;

    //@GetMapping("/dashboard/{locationId}")
    //@Operation(summary = "Obtain comprehensive Kanban data", description = "Return to today's real-time information, tomorrow's predictions and historical trend insights all at once")
    public ResponseEntity<DashboardVO> getDashboard(@PathVariable Long locationId) {
        DashboardVO dashboardData = airQualityService.getElderlyDashboard(locationId);
        return ResponseEntity.ok(dashboardData);
    }

    /**
     * Obtain the list of cities for use in the front-end drop-down menu
     */
    @GetMapping("/locations")
    public ResponseEntity<List<LocationVO>> getAllLocations() {
        List<Location> locations = locationMapper.selectList(null);

        // Convert the Entity into the VO required by the front end
        List<LocationVO> voList = locations.stream().map(loc -> {
            LocationVO vo = new LocationVO();
            vo.setId(loc.getId());
            vo.setAreaName(loc.getAreaName());
            vo.setState(loc.getState());
            return vo;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(voList);
    }

    @GetMapping("/real-time/air-quality")
    @Operation(summary = "Get real-time and tomorrow's air quality")
    public ResponseEntity<DashboardVO> getAirQuality(
            @Parameter(description = "Name of the city (e.g., beijing). If empty, defaults to server configured location.")
            @RequestParam(value = "city", required = false) String city) {

        DashboardVO data = airQualityService.getCityAirQuality(city);
        return ResponseEntity.ok(data);
    }

    @GetMapping("/history/{locationId}")
    @Operation(summary = "Get historical air quality data")
    public ResponseEntity<List<OpenDosmMonthlyData>> getHistoryAqi(
            @PathVariable("locationId") Long locationId) {

        // Parameter verification
        if (locationId == null || locationId <= 0) {
            return ResponseEntity.badRequest().build();
        }

        List<OpenDosmMonthlyData> dataList = airQualityService.getMonthlyDataByLocationId(locationId);

        return ResponseEntity.ok(dataList);
    }
}