FROM rust:1.75-alpine AS builder
WORKDIR /app
COPY . .
RUN cargo build --release --target x86_64-unknown-linux-musl
FROM alpine:3.19
RUN addgroup -S app && adduser -S app -G app
USER app
COPY --from=builder /app/target/release/backend /app/
EXPOSE 8080
CMD ["./backend"]
