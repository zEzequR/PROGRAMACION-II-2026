cd src
NODE_EXTRA_CA_CERTS=./certs/ca.crt node server.js &
cd ../feed-service
cargo run