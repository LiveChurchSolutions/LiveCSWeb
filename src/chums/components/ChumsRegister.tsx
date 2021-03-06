import React from "react";
import { ApiHelper, RegisterInterface, LoginResponseInterface, ErrorMessages, EnvironmentHelper } from ".";
import { Row, Col, Container, Button } from "react-bootstrap"
import ReactGA from "react-ga";
import { PersonInterface } from "../../helpers/Interfaces";

export const ChumsRegister: React.FC = () => {

  const [register, setRegister] = React.useState<RegisterInterface>({ churchName: "", firstName: "", lastName: "", password: "", email: "" });
  const [processing, setProcessing] = React.useState(false);
  const [errors, setErrors] = React.useState([]);
  const [redirectUrl, setRedirectUrl] = React.useState("");

  const validateEmail = (email: string) => (/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(.\w{2,3})+$/.test(email))

  const validate = () => {
    let errors: string[] = [];
    if (register.churchName === "") errors.push("Please enter your church name.")
    if (register.firstName === "") errors.push("Please enter your first name.")
    if (register.lastName === "") errors.push("Please enter your last name.")
    if (register.password === "") errors.push("Please enter a password.");
    else if (register.password.length < 6) errors.push("Passwords must be at least 6 characters.");
    if (register.email === "") errors.push("Please enter your email address.");
    else if (!validateEmail(register.email)) errors.push("Please enter a valid email address");
    setErrors(errors);
    return errors.length === 0;
  }

  const handleRegister = async (e: React.MouseEvent) => {
    e.preventDefault();
    const btn = e.currentTarget;
    btn.innerHTML = "Validating..."
    btn.setAttribute("disabled", "disabled");
    if (validate()) {
      setProcessing(true);
      btn.innerHTML = "Registering. Please wait...";
      ReactGA.event({ category: "Chums", action: "Register" });
      // check if user already exist and if so, return user's associated churches
      const verifyResponse = await ApiHelper.postAnonymous("/users/verifyCredentials", {email: register.email, password: register.password}, "AccessApi");
      if (verifyResponse.errors !== undefined || verifyResponse.churches !== undefined) {
        const errorMessage = <>There is already an account with this email address, please <a href={EnvironmentHelper.AccountsAppUrl}>login</a> to manage your churches and apps. If you wish to create a new church with this email, please register from <a href={EnvironmentHelper.ChurchAppUrl}>ChurchApps</a></>;
        setErrors([errorMessage]);

        btn.innerHTML = "Register"
        btn.removeAttribute("disabled");
        setProcessing(false);
        return;
      }
      const loginResp = await createAccess();
      if (loginResp != null) {
        btn.innerHTML = "Configuring...";
        const { person }: { person: PersonInterface} = await ApiHelper.post("/churches/init", { user: loginResp.user }, "MembershipApi");
        const promises: Promise<any>[] = [];
        promises.push(ApiHelper.post("/userchurch", { personId: person.id }, "AccessApi"));
        promises.push(ApiHelper.post("/churches/init", [], "AttendanceApi"));
        promises.push(ApiHelper.post("/churches/init", [], "GivingApi"));
        let responses = await Promise.all(promises);

        let errors: string[] = undefined;
        responses.forEach(resp => { if (resp.errors !== undefined) errors = resp.errors; });
        if (errors !== undefined) { setErrors(errors); return 0; }
        else setRedirectUrl(EnvironmentHelper.AppUrl);

      }
    }

    btn.innerHTML = "Register"
    btn.removeAttribute("disabled");
    setProcessing(false);

  }

  const createAccess = async () => {
    let resp: LoginResponseInterface = await ApiHelper.postAnonymous("/churches/register", register, "AccessApi");
    if (resp.errors !== undefined) { setErrors(resp.errors); return null; }
    else {
      const church = resp.churches[0];
      church.apis.forEach(api => { ApiHelper.setPermissions(api.keyName, api.jwt, api.permissions) })

      resp = await ApiHelper.post("/churchApps/register", { appName: "CHUMS" }, "AccessApi");
      const churches = resp.churches[0]
      if (resp.errors !== undefined) { setErrors(resp.errors); return null; }
      else {
        churches.apis.forEach(api => {
          console.log("SETTING PERMISSIONS");
          console.log(api.keyName);
          console.log(api.jwt);
          console.log(api.permissions);
          ApiHelper.setPermissions(api.keyName, api.jwt, api.permissions)
        })
        console.log(resp);
        return resp;
      }
    }
  }

  const getProcessing = () => {
    if (!processing) return null;
    else return <div className="alert alert-info" role="alert"><b>Registering...</b> Please wait.  This will take a few seconds.</div>
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.currentTarget.value;
    let r = { ...register };
    switch (e.currentTarget.name) {
      case "churchName": r.churchName = val; break;
      case "firstName": r.firstName = val; break;
      case "lastName": r.lastName = val; break;
      case "email": r.email = val; break;
      case "password": r.password = val; break;
    }
    setRegister(r);
  }

  if (redirectUrl === "") {
    return (
      <div className="homeSection" id="registerSection">
        <Container>
          <div id="register"></div>

          <Row>
            <Col lg={6} className="d-none d-lg-block"><img src="/images/chums/register.png" alt="register" className="img-fluid" /></Col>
            <Col lg={6}>
              <div className="title"><span>Join CHUMS</span></div>
              <h2>Register for a Free Account</h2>
              <p>You'll be up and running in less than a minute.</p>

              {getProcessing()}
              <ErrorMessages errors={errors} />
              <div className="form-group">
                <input type="text" className="form-control" placeholder="Church Name" name="churchName" value={register.churchName} onChange={handleChange} />
              </div>

              <div className="form-group">
                <input type="text" className="form-control" placeholder="First Name" name="firstName" value={register.firstName} onChange={handleChange} />
              </div>
              <div className="form-group">
                <input type="text" className="form-control" placeholder="Last Name" name="lastName" value={register.lastName} onChange={handleChange} />
              </div>

              <div className="form-group">
                <input type="text" className="form-control" placeholder="Email" name="email" value={register.email} onChange={handleChange} />
              </div>
              <div className="form-group">
                <input type="password" className="form-control" placeholder="Password" name="password" value={register.password} onChange={handleChange} />
              </div>
              <Button variant="success" block onClick={handleRegister}>Get Started for Free</Button>

            </Col>
          </Row>
        </Container>
      </div>
    );
  } else {
    window.location.href = redirectUrl;
    return (<></>);
  }
}
