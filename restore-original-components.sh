#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Restoring original components...${NC}"

# Restore DeviceAccess.jsx
if [ -f "src/components/device/DeviceAccess.jsx.backup" ]; then
  cp src/components/device/DeviceAccess.jsx.backup src/components/device/DeviceAccess.jsx
  echo -e "${GREEN}Restored original DeviceAccess.jsx${NC}"
else
  echo -e "${RED}Error: DeviceAccess.jsx.backup not found${NC}"
fi

# Restore StorageCapabilities.jsx
if [ -f "src/components/storage/StorageCapabilities.jsx.backup" ]; then
  cp src/components/storage/StorageCapabilities.jsx.backup src/components/storage/StorageCapabilities.jsx
  echo -e "${GREEN}Restored original StorageCapabilities.jsx${NC}"
else
  echo -e "${RED}Error: StorageCapabilities.jsx.backup not found${NC}"
fi

# Restore HapticFeedback.jsx
if [ -f "src/components/device/HapticFeedback.jsx.backup" ]; then
  cp src/components/device/HapticFeedback.jsx.backup src/components/device/HapticFeedback.jsx
  echo -e "${GREEN}Restored original HapticFeedback.jsx${NC}"
else
  echo -e "${RED}Error: HapticFeedback.jsx.backup not found${NC}"
fi

echo -e "${GREEN}Component restoration complete${NC}"
