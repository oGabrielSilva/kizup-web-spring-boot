package com.social.noble.kizup.enums;

public enum UserRole {
    ROOT("ROOT"),
    ADMIN("ADMIN"),
    MODERATOR("MODERATOR"),
    TUTOR("TUTOR"),
    COMMON("COMMON");

    private final String role;

    UserRole(String role) {
        this.role = role;
    }

    public String getRole() {
        return role;
    }

}
