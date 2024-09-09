# Use the official Ubuntu 20.04 image as the base
FROM ubuntu:20.04

# Set environment variable to avoid user interaction during package installations
ENV DEBIAN_FRONTEND=noninteractive

# Install dependencies
RUN apt-get update && \
    apt-get install -y \
    build-essential \
    curl \
    wget \
    vim \
    nano \
    git \
    python3 \
    python3-pip \
    openjdk-11-jdk \
    nodejs \
    npm \
    ruby-full \
    php \
    gcc \
    g++ \
    mono-complete \
    tzdata \
    inotify-tools && \
    rm -rf /var/lib/apt/lists/*

# Set timezone to UTC (or change to your preferred timezone)
RUN ln -fs /usr/share/zoneinfo/UTC /etc/localtime && \
    dpkg-reconfigure -f noninteractive tzdata

# Set up your working directory
WORKDIR /project

# Copy your file-watching script into the container
COPY watch_files.sh /usr/local/bin/watch_files.sh

# Make sure the script is executable
RUN chmod +x /usr/local/bin/watch_files.sh

# Set the default command to run your file-watching script and start the shell
ENTRYPOINT ["/bin/bash", "-c", "/usr/local/bin/watch_files.sh & exec bash"]
