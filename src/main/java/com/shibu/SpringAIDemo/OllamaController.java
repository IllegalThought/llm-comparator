package com.shibu.SpringAIDemo;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.ollama.OllamaChatModel;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ollama")
@CrossOrigin("*")
public class OllamaController {

    private final ChatClient chatClient;

    public OllamaController(OllamaChatModel chatModel) {
        this.chatClient = ChatClient.create(chatModel);
    }

    @PostMapping("/chat")
    public OllamaResponse chat(
            @RequestBody OllamaRequest request) {

        String response = chatClient
                .prompt(request.message())
                .call()
                .content();

        return new OllamaResponse(response);
    }

    public record OllamaRequest(String message) {}

    public record OllamaResponse(String response) {}
}