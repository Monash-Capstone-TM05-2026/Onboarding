package com.onboarding.demo.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("air_quality_data")
public class AirQualityData {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long locationId;
    private LocalDateTime recordTime;
    private Integer apiValue;
    private BigDecimal pm25Value;
    private Integer isForecast; // 0:当前真实记录, 1:明日预测数据

    @TableLogic
    private Integer isDeleted;
}
