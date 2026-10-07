cd feed-service
cargo build
cargo run &
sleep 3

cd ../src
NODE_EXTRA_CA_CERTS=./certs/ca.crt node server.js &
NODE_EXTRA_CA_CERTS=./certs/ca.crt node consumers/feedConsumer.js &
NODE_EXTRA_CA_CERTS=./certs/ca.crt node consumers/emailConsumer.js