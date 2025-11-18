package com.matricula_universitaria.events;

public final class KafkaTopics {

    private KafkaTopics() {
    }

    public static final String USER_CREATED_TOPIC = "user.created";
    public static final String USER_UPDATED_TOPIC = "user.updated";
    public static final String USER_DELETED_TOPIC = "user.deleted";
}
