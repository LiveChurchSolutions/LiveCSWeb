import React from "react";
import { Footer, Header } from "../components"
import { Container } from "react-bootstrap";
import { ApiHelper, EnvironmentHelper } from "../helpers";

export const ThankYou: React.FC = (props: any) => {

    const logSession = () => {
        let search = new URLSearchParams(props.location.search);
        var sessionId = search.get("sessionId");
        if (sessionId !== null) {
            const data = { sessionId: sessionId, churchId: EnvironmentHelper.ChurchId }
            ApiHelper.postAnonymous("/donate/log", data, "GivingApi");
        }
    }

    React.useEffect(logSession, []);


    return (
        <>
            <Header />
            <Container>
                <div style={{ minHeight: 700 }}>
                    <h1>Thank You!</h1>
                    <p className="intro">Thank you for donating to Live Church Solutions.</p>
                    <br />
                </div>
            </Container>
            <Footer />
        </>
    );
}
