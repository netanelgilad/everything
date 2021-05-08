FROM ubuntu

ADD ./target/node14-linux/opah /opah

ENTRYPOINT ["/opah"]