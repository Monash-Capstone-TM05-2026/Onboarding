package com.onboarding.demo.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardVO {
    @Schema(description = "Current air quality index (AQI)", example = "75")
    private Integer currentApi;
    
    @Schema(description = "The current air quality grade color", example = "green")
    private String currentColor;
    
    @Schema(description = "Current air quality recommendations", example = "The air quality is good and suitable for outdoor activities")
    private String currentAdvice;
    
    @Schema(description = "The air quality index is predicted for tomorrow (AQI)", example = "80")
    private Integer tomorrowApi;
    
    @Schema(description = "The color of tomorrow's air quality grade", example = "yellow")
    private String tomorrowColor;
    
    @Schema(description = "Air quality suggestions for tomorrow", example = "Sensitive people should reduce outdoor activities")
    private String tomorrowAdvice;
    
    @Schema(description = "Conclusion of historical trend analysis", example = "The air quality has shown an improving trend over the past week")
    private String historicalInsight;
}