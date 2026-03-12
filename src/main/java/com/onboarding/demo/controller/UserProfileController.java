package com.onboarding.demo.controller;

import com.onboarding.demo.entity.UserProfile;
import com.onboarding.demo.mapper.UserProfileMapper;
import io.swagger.v3.oas.annotations.Hidden;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "老年用户资料管理", description = "提供用户资料的查询与维护接口")
@Hidden
@RestController
@RequestMapping("/api/users")
//@RequiredArgsConstructor
public class UserProfileController {

    private final UserProfileMapper userProfileMapper;

    public UserProfileController(UserProfileMapper userProfileMapper) {
        this.userProfileMapper = userProfileMapper;
    }

    @Operation(summary = "获取所有用户列表", description = "查询未被逻辑删除的所有用户数据")
    @GetMapping
    public List<UserProfile> getAllUsers() {
        // MyBatis-Plus 会自动在末尾拼接 WHERE is_deleted = 0
        return userProfileMapper.selectList(null);
    }

    @Operation(summary = "获取单个用户详情", description = "根据主键 ID 查询用户")
    @GetMapping("/{id}")
    public UserProfile getUserById(
            @Parameter(description = "用户主键ID", required = true) @PathVariable Long id) {
        UserProfile user = userProfileMapper.selectById(id);

        System.out.println("=== 用户对象 toString ===");
        System.out.println(user); // 如果 Lombok 生效，这里会输出完整字段
        System.out.println("用户名：" + user.getUsername()); // 如果这行不报错，说明 Getter 存在

        return user;
    }
}
