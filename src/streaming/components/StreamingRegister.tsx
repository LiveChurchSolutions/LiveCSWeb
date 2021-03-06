import React from "react";
import { Link } from "react-router-dom";
import { ApiHelper, RegisterInterface, RoleInterface, LoginResponseInterface, RolePermissionInterface, ErrorMessages, ChurchInterface, UserInterface, EnvironmentHelper, PersonInterface } from ".";
import ReactGA from "react-ga";
import { Row, Col } from "react-bootstrap";

export const StreamingRegister: React.FC = () => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [churchName, setChurchName] = React.useState("");
  const [subDomain, setSubDomain] = React.useState("");
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [errors, setErrors] = React.useState([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.currentTarget.value;
    switch (e.currentTarget.name) {
      case "email": setEmail(val); break;
      case "password": setPassword(val); break;
      case "churchName": setChurchName(val); break;
      case "subDomain": setSubDomain(val.toLowerCase().replaceAll(/[^a-z0-9]/ig, "")); break;
      case "firstName": setFirstName(val); break;
      case "lastName": setLastName(val); break;
    }
  }

  const validate = async () => {
    let errors = [];
    if (churchName === "") errors.push("Please enter your church/organization name.");
    if (subDomain === "") errors.push("Please select a subdomain for your site.");
    if (email === "") errors.push("Please enter your email address.");
    if (password === "") errors.push("Please enter a password.");
    if (firstName === "") errors.push("Please enter your first name.")
    if (lastName === "") errors.push("Please enter your last name.")
    setErrors(errors);
    return errors.length === 0;
  }

  const handleRegister = async (e: React.MouseEvent) => {
    e.preventDefault();
    const btn = e.currentTarget;
    btn.innerHTML = "Validating..."
    if (await validate()) {
      btn.innerHTML = "Registering. Please wait..."
      btn.setAttribute("disabled", "disabled");
      ReactGA.event({ category: "Streaming", action: "Register" });
      // check if user already exist and if so, return user's associated churches
      const verifyResponse = await ApiHelper.postAnonymous("/users/verifyCredentials", { email, password }, "AccessApi");
      if (verifyResponse.errors !== undefined || verifyResponse.churches !== undefined) {
        const errorMessage = <>There is already an account with this email address, please <a href={EnvironmentHelper.AccountsAppUrl}>login</a> to manage your churches and apps. If you wish to create a new church with this email, please register from <a href={EnvironmentHelper.ChurchAppUrl}>ChurchApps</a></>;
        setErrors([errorMessage]);

        btn.innerHTML = "Register"
        btn.removeAttribute("disabled");

        return;
      }

      let church: ChurchInterface = null;

      //Create Access
      let loginResp = await createAccess();
      church = loginResp.churches.filter(c => c.subDomain === subDomain)[0];
      if (church != null) {
        btn.innerHTML = "Configuring..."
        let resp: LoginResponseInterface = await ApiHelper.post("/churches/init", { appName: "StreamingLive" }, "StreamingLiveApi");
        const { person }: { person: PersonInterface} = await ApiHelper.post("/churches/init", { user: loginResp.user }, "MembershipApi");
        await ApiHelper.post("/userchurch", { personId: person.id }, "AccessApi");
        if (resp.errors !== undefined) { setErrors(resp.errors); return 0; }
        else {
          window.location.href = EnvironmentHelper.SubUrl.replace("{key}", church.subDomain) + "/login/?jwt=" + ApiHelper.getConfig("AccessApi").jwt;
        }
      }
    }
    btn.innerHTML = "Register"
    btn.removeAttribute("disabled");
  }

  const createAccess = async () => {
    let data: RegisterInterface = { churchName, firstName, lastName, email, password, subDomain };

    let resp: LoginResponseInterface = await ApiHelper.postAnonymous("/churches/register", data, "AccessApi");
    if (resp.errors !== undefined) { setErrors(resp.errors); return null; }
    else {
      const church = resp.churches[0];
      church.apis.forEach(api => { ApiHelper.setPermissions(api.keyName, api.jwt, api.permissions) });
      let response: LoginResponseInterface = await ApiHelper.post("/churchApps/register", { appName: "StreamingLive" }, "AccessApi");
      if (response.errors !== undefined) { setErrors(response.errors); return null; }
      else {
        const church = response.churches[0];
        church.apis.forEach(api => { ApiHelper.setPermissions(api.keyName, api.jwt, api.permissions) });
        await addHostRole(church, response.user)
        return resp;
      }
    }

  }

  const addHostRole = async (church: ChurchInterface, user: UserInterface) => {
    let role: RoleInterface = { churchId: church.id, name: "Hosts" };
    role.id = (await ApiHelper.post("/roles", [role], "AccessApi"))[0].id;

    const permissions: RolePermissionInterface[] = [];
    permissions.push({ churchId: church.id, apiName: "MessagingApi", contentType: "Chat", action: "Host", roleId: role.id });
    await ApiHelper.post("/rolepermissions", permissions, "AccessApi");
  }

  return (
    <>
      <div id="register">
        <div className="container">
          <div className="text-center">
            <h2 style={{ marginBottom: 20 }}>Register <span>Your Church</span></h2>
          </div>

          <div className="row">
            <div className="col-lg-6">
              <p>This is a <b><u>completely free</u></b> service offered to churches by <a href="https://livecs.org/">Live Church Solutions</a>, a 501(c)(3) organization with EIN 45-5349618, that was founded in 2012 with the goal of helping small churches with their technical needs.</p>
              <p>If you would like to help support our mission of enabling churches to thrive with technology solutions, please consider <a href="https://livecs.org/partner/">partnering with us</a>.</p>
            </div>
            <div className="col-lg-6">
              <ErrorMessages errors={errors} />

              <div id="registerBox">
                <form method="post">
                  <div className="form-group">
                    <input type="text" name="churchName" value={churchName} className="form-control" placeholder="Church Name" onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <div className="input-group">
                      <input type="text" name="subDomain" className="form-control" placeholder="yourchurch" value={subDomain} onChange={handleChange} />
                      <div className="input-group-append"><span className="input-group-text">.streaminglive.church</span></div>
                    </div>
                  </div>
                  <Row>
                    <Col>
                      <div className="form-group">
                        <input type="text" className="form-control" placeholder="First Name" name="firstName" value={firstName} onChange={handleChange} />
                      </div>
                    </Col>
                    <Col>
                      <div className="form-group">
                        <input type="text" className="form-control" placeholder="Last Name" name="lastName" value={lastName} onChange={handleChange} />
                      </div>
                    </Col>
                  </Row>
                  <div className="form-group">
                    <input type="text" name="email" value={email} className="form-control" placeholder="Email Address" onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <input type="password" name="password" value={password} className="form-control" placeholder="Password" onChange={handleChange} />
                  </div>
                  <button className="btn btn-lg btn-primary btn-block" onClick={handleRegister}>Register</button>
                </form>
                <br />
                <div>
                                    Already have a site? <Link to="/login">Login</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
