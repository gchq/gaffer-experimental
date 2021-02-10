package com.example.SpringbootTest;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import com.example.springboottest.Graph;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;
import org.junit.jupiter.api.Disabled;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

@Ignore("Ignore the this test till Openshift CRD permission issue is fixed")
public class GraphControllerTests extends AbstractTest {
	@Override
	@Before
	public void setUp() {
		super.setUp();
	}

	@Test
	public void getGraphsList() throws Exception {
		String uri = "/graphs";
		MvcResult mvcResult = mvc.perform(MockMvcRequestBuilders.get(uri)
				.accept(MediaType.APPLICATION_JSON_VALUE)).andReturn();

		int status = mvcResult.getResponse().getStatus();
		assertEquals(200, status);
		String content = mvcResult.getResponse().getContentAsString();
		Graph[] graphtlist = super.mapFromJson(content, Graph[].class);
		assertTrue(graphtlist.length > 0);
		assertEquals("OurGraph", graphtlist[0].getGraphId());
		assertEquals("YES", graphtlist[0].getDescription());
	}



	@Test
	public void addGraph() throws Exception {
		String uri = "/graphs";
		Graph graph = new Graph("graph id 1","desc tes");
		String inputJson = super.mapToJson(graph);
		MvcResult mvcResult = mvc.perform(MockMvcRequestBuilders.post(uri)
				.contentType(MediaType.APPLICATION_JSON_VALUE)
				.content(inputJson)).andReturn();

		int status = mvcResult.getResponse().getStatus();
		assertEquals(201, status);
	}

	@Test
	public void deleteGraph() throws Exception {
//		String uri = "/graphs/2";
//		MvcResult mvcResult = mvc.perform(MockMvcRequestBuilders.delete(uri)).andReturn();
//		int status = mvcResult.getResponse().getStatus();
//		assertEquals(200, status);
//		String content = mvcResult.getResponse().getContentAsString();
//		assertEquals("Record "+ 2 +" is deleted", content);
	}
}