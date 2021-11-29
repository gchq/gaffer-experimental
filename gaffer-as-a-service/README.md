# gaffer-as-a-service

### OWASP Dependency Checker
By default, the plugin is tied to the verify phase (i.e. `mvn verify`). 
Alternatively, one can directly invoke the plugin via `mvn org.owasp:dependency-check-maven:check`.
The report can be found at `./gaffer-as-a-service/target/dependency-check-report.html`.