package com.onboarding.demo.service;

import com.onboarding.demo.vo.DashboardVO;

public interface AirQualityService {
    /**
     * Obtain the exclusive air quality dashboard data for the elderly
     * @param locationId
     * @return Assembled Kanban view data
     */
    DashboardVO getElderlyDashboard(Long locationId);
}