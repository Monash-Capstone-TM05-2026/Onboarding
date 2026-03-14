package com.onboarding.demo.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
@TableName("air_quality_advice_rule")
public class AirQualityAdviceRule {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String indicatorType; // API 或 PM2.5
    private BigDecimal minVal;
    private BigDecimal maxVal;
    private String riskLevel;
    private String colorCode;
    private String adviceText;

    @TableLogic
    private Integer isDeleted;
}