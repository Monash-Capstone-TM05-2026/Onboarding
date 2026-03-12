package com.onboarding.demo.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.onboarding.demo.entity.AirQualityAdviceRule;
import com.onboarding.demo.entity.OpenDosmMonthlyData;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface OpenDosmMonthlyDataMapper extends BaseMapper<OpenDosmMonthlyData> {}