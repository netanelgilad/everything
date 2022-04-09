FROM gitpod/workspace-full

RUN brew install zsh
RUN sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
ENV SHELL=zsh

RUN echo '\nexport PATH="$PATH:$(yarn global bin)"\n' >> ~/.zshrc
RUN yarn global add opah@main