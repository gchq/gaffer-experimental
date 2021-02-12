package uk.gov.gchq.gaffer;
import java.io.*;
import java.net.URISyntaxException;
import java.net.URL;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.atomic.AtomicLong;

import io.kubernetes.client.common.KubernetesObject;
import io.kubernetes.client.openapi.*;
import io.kubernetes.client.openapi.apis.*;
import io.kubernetes.client.openapi.models.V1ObjectMeta;
import org.jose4j.json.internal.json_simple.*;
import org.springframework.beans.factory.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.*;
import org.springframework.web.bind.annotation.*;
import uk.gov.gchq.gaffer.auth.*;


@Component
@CrossOrigin
@RestController
public class GraphController {

	@Autowired
	private AuthenticationManager authenticationManager;

	@Autowired
	private JwtTokenUtil jwtTokenUtil;

	@Autowired
	private JwtUserDetailsService userDetailsService;

	@Autowired
	private ApiClient apiClient;


	private JwtResponse jwtResponse;

	@GetMapping("/graphs")
	public List<Graph> graph(@RequestParam(value = "name", defaultValue = "gaffer") String name) {
		ArrayList<Graph> graphList = new ArrayList<>();
		graphList.add(new Graph("OurGraph", "YES"));
		return graphList;
	}

	@PostMapping(path = "/graphs", consumes = "application/json", produces = "application/json")
	public ResponseEntity<?> graph(@RequestBody Graph graph) throws IOException {
		CustomObjectsApi customObject = new CustomObjectsApi(apiClient);
		V1ObjectMeta objectMeta = new V1ObjectMeta();
		objectMeta.setName(graph.getGraphId());
		JSONObject graphSetup = new JSONObject();
		graphSetup.put("kind", "Gaffer");
		graphSetup.put("metadata",objectMeta);
		graphSetup.put("apiVersion","gchq.gov.uk/v1");

		try {
			Object result = customObject.createNamespacedCustomObject("gchq.gov.uk", "v1", "kai-helm-3", "gaffers", graphSetup, null, null, null);
			System.out.println(result);
		} catch (ApiException e) {
			System.err.println("Exception when calling CustomObjectsApi#createNamespacedCustomObject");
			System.err.println("Status code: " + e.getCode());
			System.err.println("Reason: " + e.getResponseBody());
			System.err.println("Response headers: " + e.getResponseHeaders());
			e.printStackTrace();
		}
			return new ResponseEntity(HttpStatus.CREATED);

	}

	@PostMapping("/auth")
	public ResponseEntity<?> createAuthenticationToken(@RequestBody JwtRequest authenticationRequest) throws Exception {

		authenticate(authenticationRequest.getUsername(), authenticationRequest.getPassword());

		final UserDetails userDetails = userDetailsService
				.loadUserByUsername(authenticationRequest.getUsername());

		final String token = jwtTokenUtil.generateToken(userDetails);
		jwtResponse = new JwtResponse((token));
		return ResponseEntity.ok(token);
	}

	private void authenticate(String username, String password) throws Exception {
		try {
			authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(username, password));
		} catch (DisabledException e) {
			throw new Exception("USER_DISABLED", e);
		} catch (BadCredentialsException e) {
			throw new Exception("INVALID_CREDENTIALS", e);
		}
	}

	@DeleteMapping("/graphs/{graphId}")
	public String deleteGraph(@PathVariable String graphId){
//		OpenShiftClient osClient = new DefaultOpenShiftClient();
//		Boolean deleted = osClient.customResourceDefinitions().withName(graphId).delete();
		return "Record Deleted";
	}
}