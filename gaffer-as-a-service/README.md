# gaffer-as-a-service

### OWASP Dependency Checker
By default, the plugin is tied to the verify phase (i.e. `mvn verify`). 
Alternatively, one can directly invoke the plugin via `mvn org.owasp:dependency-check-maven:check`.
The report can be found at `./gaffer-as-a-service/target/dependency-check-report.html`.

## gaffer-as-a-service and Authentication using Sidecars
The authentication for GaaS-UI and GaaS Rest now follows the sidecar design pattern. The diagram below illustartes this.
To put it simply, the authentication functionality is seperated from GaaS-Rest and works as a microservice.
<img width="903" alt="Screenshot 2022-03-29 at 10 55 58 am" src="https://user-images.githubusercontent.com/60354187/160585824-c4ebbd80-8b16-4ed2-abf8-5c6373c1a12c.png">

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
* In GaaS-UI set the ENV variables in the `.env` file. For example, when running everything using JWT authentication, the env variables are set to the image shown below:
![image](https://user-images.githubusercontent.com/60354187/160592401-e0127719-56cb-4353-b3e9-f100f75a850c.png)
* Run the GaaS-UI
* You should be able to login to the demo app by using the username: `javainuse` and password: `password`.
