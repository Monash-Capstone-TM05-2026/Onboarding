package com.onboarding.demo.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("user_profile")
public class UserProfile {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String username;

    private String passwordHash;

    private String fullName;

    private Integer age;

    private String healthCondition;

    private Long defaultLocationId;

    /**
     * 是否开启警报通知 (1:开启, 0:关闭)
     */
    private Integer alertEnabled;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;

    /**
     * 逻辑删除字段 (0:未删除, 1:已删除)
     */
    @TableLogic
    private Integer isDeleted;
}
