#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Installing updated Capacitor-enabled components...${NC}"

# Check if DeviceAccess.jsx exists
if [ -f "src/components/device/DeviceAccess.jsx" ]; then
  # Create backup if not already done
  if [ ! -f "src/components/device/DeviceAccess.jsx.backup" ]; then
    cp src/components/device/DeviceAccess.jsx src/components/device/DeviceAccess.jsx.backup
    echo -e "${GREEN}Created backup of DeviceAccess.jsx${NC}"
  fi

  # Copy updated component
  if [ -f "src/components/device/DeviceAccess-capacitor.jsx" ]; then
    cp src/components/device/DeviceAccess-capacitor.jsx src/components/device/DeviceAccess.jsx
    echo -e "${GREEN}Installed Capacitor-enabled DeviceAccess.jsx${NC}"
  else
    echo -e "${RED}Error: DeviceAccess-capacitor.jsx not found${NC}"
  fi
else
  echo -e "${RED}Error: DeviceAccess.jsx not found in src/components/device/${NC}"
fi

# Check if StorageCapabilities.jsx exists
if [ -f "src/components/storage/StorageCapabilities.jsx" ]; then
  # Create backup if not already done
  if [ ! -f "src/components/storage/StorageCapabilities.jsx.backup" ]; then
    cp src/components/storage/StorageCapabilities.jsx src/components/storage/StorageCapabilities.jsx.backup
    echo -e "${GREEN}Created backup of StorageCapabilities.jsx${NC}"
  fi

  # Copy updated component
  if [ -f "src/components/storage/StorageCapabilities-capacitor.jsx" ]; then
    cp src/components/storage/StorageCapabilities-capacitor.jsx src/components/storage/StorageCapabilities.jsx
    echo -e "${GREEN}Installed Capacitor-enabled StorageCapabilities.jsx${NC}"
  else
    echo -e "${RED}Error: StorageCapabilities-capacitor.jsx not found${NC}"
  fi
else
  echo -e "${RED}Error: StorageCapabilities.jsx not found in src/components/storage/${NC}"
fi

# Check if HapticFeedback.jsx was already updated by setup-capacitor.sh
if [ -f "src/components/device/HapticFeedback.jsx.backup" ]; then
  echo -e "${GREEN}HapticFeedback.jsx already updated by setup-capacitor.sh${NC}"
else
  echo -e "${RED}Warning: HapticFeedback.jsx wasn't backed up by setup-capacitor.sh${NC}"
  echo -e "${BLUE}Make sure to run setup-capacitor.sh first before this script${NC}"
fi

echo -e "${GREEN}Component installation complete${NC}"
echo -e "${BLUE}You can restore original components anytime by running restore-original-components.sh${NC}"

# Create restore script
cat > restore-original-components.sh << 'RESTORE'
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
RESTORE

chmod +x restore-original-components.sh
echo -e "${GREEN}Created restore-original-components.sh script${NC}"

chmod +x install-capacitor-components.sh
