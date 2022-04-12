# gaffer-as-a-service

### OWASP Dependency Checker
By default, the plugin is tied to the verify phase (i.e. `mvn verify`). 
Alternatively, one can directly invoke the plugin via `mvn org.owasp:dependency-check-maven:check`.
The report can be found at `./gaffer-as-a-service/target/dependency-check-report.html`.

## gaffer-as-a-service and Authentication using Sidecars
The authentication for GaaS-UI and GaaS Rest now follows the sidecar design pattern. The diagram below illustartes this.
To put it simply, the authentication functionality is seperated from GaaS-Rest and works as a microservice.
<img width="1022" alt="Screenshot 2022-04-01 at 3 28 55 pm" src="https://user-images.githubusercontent.com/60354187/161284073-fbcb845b-351b-4686-93f1-7c0aa1cb8bd6.png">



### What is Eureka?
[Eureka Server](https://cloud.spring.io/spring-cloud-netflix/multi/multi_spring-cloud-eureka-server.html) is a service discovery application that registers microservices, holding information about ports and IP addresses.
We need Eureka to be able to use GaaS-Rest and the Authentication sidecar together.
To access the Eureka Dashboard when running locally visit `http://localhost:8761/dashboard`

### Running everything locally

* Start of by deciding which sidecar you'd like to use, for local use, JWT is the best option.
* Run the following, order doesnt matter as long as all 3 are eventually running:
  * Gaas-Rest
  * Eureka Server
  * Your chosen side car
* In GaaS-UI set the ENV variables in the `.env` file. For example, when running everything using JWT authentication, the env variables are set as below:
* `REACT_APP_API_PLATFORM="OTHER"
  REACT_APP_KAI_REST_API_HOST="http://localhost:8081/gaas-rest-service/"
  REACT_APP_COGNITO_USERPOOLID=""
  REACT_APP_COGNITO_CLIENTID=""
  REACT_APP_AUTH_ENDPOINT="http://localhost:8081/gaas-sidecar-service/"
  REACT_APP_COGNITO_SCOPE = ""
  REACT_APP_COGNITO_REDIRECT_URI = ""
  SKIP_PREFLIGHT_CHECK="true"`
* Run the GaaS-UI
* You should be able to login to the demo app by using the username: `javainuse` and password: `password`.
