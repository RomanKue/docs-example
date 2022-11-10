{{ .Env.PACKAGE }}

import javax.ws.rs.GET;
import javax.ws.rs.HeaderParam;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

@Path("/v1/")
public class GreetingResource {

    @GET
    @Produces(MediaType.TEXT_PLAIN)
    public String hello(@HeaderParam("Unity-UserName") final String userName) {
        return "Hello " + userName + ", this is UNITY 🚀";
    }
}
