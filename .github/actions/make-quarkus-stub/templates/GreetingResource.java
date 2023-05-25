{{ .Env.PACKAGE }}

import org.eclipse.microprofile.openapi.annotations.parameters.Parameter;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.HeaderParam;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

@Path("/v1/")
public class GreetingResource {

    @GET
    @Produces(MediaType.TEXT_PLAIN)
    public String hello(@Parameter(hidden=true) @HeaderParam("Unity-UserName") final String userName) {
        return "Hello " + userName + ", this is UNITY 🚀";
    }
}
