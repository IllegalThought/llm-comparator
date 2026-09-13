package com.shibu.SpringAIDemo;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.google.genai.GoogleGenAiChatModel;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/gemini")
public class GeminiController {

    private final ChatClient chatClient;

    public GeminiController(GoogleGenAiChatModel chatModel) {
        this.chatClient = ChatClient.create(chatModel);
    }

    @PostMapping("/chat")
    public GeminiResponse chat(@RequestBody GeminiRequest request) {

        String response = chatClient
                .prompt(request.message())
                .call()
                .content();

        return new GeminiResponse(response);
    }

    public record GeminiRequest(String message) {}

    public record GeminiResponse(String response) {}
}