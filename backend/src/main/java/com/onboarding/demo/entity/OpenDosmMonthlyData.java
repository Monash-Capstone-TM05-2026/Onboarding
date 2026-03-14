package com.onboarding.demo.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@TableName("open_dosm_monthly_data")
public class OpenDosmMonthlyData {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long locationId;
    private LocalDate recordDate;
    private String pollutant;
    private BigDecimal concentration;

    @TableLogic
    private Integer isDeleted;
}