package com.onboarding.demo.service;

import com.onboarding.demo.entity.OpenDosmMonthlyData;
import com.onboarding.demo.vo.DashboardVO;

import java.util.List;

public interface AirQualityService {
    /**
     * Obtain the exclusive air quality dashboard data for the elderly
     * @param locationId
     * @return Assembled Kanban view data
     */
    DashboardVO getElderlyDashboard(Long locationId);

    DashboardVO getCityAirQuality(String city);

    List<OpenDosmMonthlyData> getMonthlyDataByLocationId(Long locationId);
}