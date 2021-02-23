if [ -z ${REACT_APP_API_PLATFORM} ]; 
then echo "REACT_APP_API_PLATFORM is unset"; 
else echo "REACT_APP_API_PLATFORM is set to '${REACT_APP_API_PLATFORM}'"
react-scripts build; 
fi
