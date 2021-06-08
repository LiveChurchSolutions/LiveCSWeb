import React from "react"
import { Row, Container } from "react-bootstrap";

export const HomeNav: React.FC = () => (<>
  <div id="homeNavbar" className="fixed-top">
    <Container>
      <Row>
        <div className="col-4"><a className="navbar-brand" href="/"><img src="/images/logo.png" alt="logo" /></a></div>
        <div className="col-8 text-right" id="navRight">
          <a href="/" className="link">About Us</a>
          <a href="/solutions" className="link">Solutions</a>
          <a href="/partner" className="link">Partner</a>
        </div>
      </Row>
    </Container>
  </div>
  <div id="navSpacer"></div>
</>)
