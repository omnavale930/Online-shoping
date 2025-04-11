// CartController.java
package com.example.demo.controller;

import com.example.demo.model.CartItem;
import com.example.demo.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/customer/cart")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class CartController {
    private final CartService cartService;
    
    @GetMapping
    public ResponseEntity<List<CartItem>> getCart(@RequestHeader("X-Session-ID") String sessionId) {
        return ResponseEntity.ok(cartService.getCartItems(sessionId));
    }
    
    @PostMapping("/add")
    public ResponseEntity<CartItem> addToCart(
            @RequestParam Long productId,
            @RequestParam Integer quantity,
            @RequestHeader("X-Session-ID") String sessionId) {
        return ResponseEntity.ok(cartService.addToCart(productId, quantity, sessionId));
    }
    
    @PutMapping("/update/{cartItemId}")
    public ResponseEntity<Void> updateCartItem(
            @PathVariable Long cartItemId,
            @RequestParam Integer quantity) {
        cartService.updateCartItemQuantity(cartItemId, quantity);
        return ResponseEntity.ok().build();
    }
    
    @DeleteMapping("/remove/{cartItemId}")
    public ResponseEntity<Void> removeFromCart(@PathVariable Long cartItemId) {
        cartService.removeFromCart(cartItemId);
        return ResponseEntity.ok().build();
    }
    
    @DeleteMapping("/clear")
    public ResponseEntity<Void> clearCart(@RequestHeader("X-Session-ID") String sessionId) {
        cartService.clearCart(sessionId);
        return ResponseEntity.ok().build();
    }
}