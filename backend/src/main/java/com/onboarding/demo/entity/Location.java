package com.onboarding.demo.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("location")
public class Location {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String state;

    private String areaName;

    private BigDecimal latitude;

    private BigDecimal longitude;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    private Integer isDeleted;
}