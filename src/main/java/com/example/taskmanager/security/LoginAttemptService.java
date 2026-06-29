package com.example.taskmanager.security;

import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class LoginAttemptService {

    private final int MAX_ATTEMPTS = 3;
    private final int LOCK_DURATION_SECONDS = 30;

    private final ConcurrentHashMap<String, Integer> attemptsCache = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, LocalDateTime> lockCache = new ConcurrentHashMap<>();

    // Login successful? Remove bad attempts
    public void loginSucceeded(String username) {
        attemptsCache.remove(username);
        lockCache.remove(username);
    }

    // Bad password? Bad point for you.
    public void loginFailed(String username) {
        int attempts = attemptsCache.getOrDefault(username, 0);
        attempts++;
        attemptsCache.put(username, attempts);

        // Limit reached? 30s ban
        if (attempts >= MAX_ATTEMPTS) {
            lockCache.put(username, LocalDateTime.now().plusSeconds(LOCK_DURATION_SECONDS));
        }
    }

    // Has the user currently ban?
    public boolean isBlocked(String username) {
        if (lockCache.containsKey(username)) {
            LocalDateTime lockTime = lockCache.get(username);
            if (LocalDateTime.now().isBefore(lockTime)) {
                return true;
            } else {
                lockCache.remove(username);
                attemptsCache.remove(username);
                return false;
            }
        }
        return false;
    }
}
