package com.onboarding.demo.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DashboardVO {
    @Schema(description = "Current air quality index (AQI)", example = "75")
    private Integer currentAqi;
    
    @Schema(description = "The current air quality grade color", example = "green")
    private String currentColor;
    
    @Schema(description = "Current air quality recommendations", example = "The air quality is good and suitable for outdoor activities")
    private String currentAdvice;
    
    @Schema(description = "The air quality index is predicted for tomorrow (AQI)", example = "80")
    private Integer tomorrowAqi;
    
    @Schema(description = "The color of tomorrow's air quality grade", example = "yellow")
    private String tomorrowColor;
    
    @Schema(description = "Air quality suggestions for tomorrow", example = "Sensitive people should reduce outdoor activities")
    private String tomorrowAdvice;
    
    @Schema(description = "Conclusion of historical trend analysis", example = "The air quality has shown an improving trend over the past week")
    private String historicalInsight;

    @Schema(description = "Current city name", example = "Shah Alam, Selangor, Malaysia")
    private String currentCity;

    @Schema(description = "The last updated time of the air quality data", example = "2026-03-13 20:00:00")
    private String lastUpdated;
}