package com.onboarding.demo.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
public class LocationVO {
    @Schema(description = "Region ID", example = "1")
    private Long id;
    
    @Schema(description = "Name of the region", example = "Subang Jaya")
    private String areaName;
    
    @Schema(description = "Province/State to which it belongs", example = "Selangor")
    private String state;
}