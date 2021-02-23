import React from "react"
import { Row, Col, FormGroup, FormControl, InputGroup } from "react-bootstrap";
import { InputBox, } from "../appBase/components";
import { ApiHelper, EnvironmentHelper } from "../helpers";
import { loadStripe } from '@stripe/stripe-js';


export const DonateRedirect: React.FC = () => {
    const [amount, setAmount] = React.useState(25);

    const [errors, setErrors] = React.useState<string[]>([]);
    const [name, setName] = React.useState("");
    const [address, setAddress] = React.useState("");
    const [city, setCity] = React.useState("");
    const [state, setState] = React.useState("");
    const [zip, setZip] = React.useState("");

    const handleDonate = async () => {
        //const gateways = await ApiHelper.getAnonymous("/gateways", "GivingApi");
        //if (gateways.length > 0) {
        //const stripePromise = loadStripe(gateways[0].primaryKey);
        const stripePromise = loadStripe(EnvironmentHelper.StripePK);
        const stripe = await stripePromise;
        const data = {
            churchId: EnvironmentHelper.ChurchId,
            successUrl: window.location.origin.toString() + "/thankyou",
            cancelUrl: window.location.href,
            amount: amount,
            name: name,
            address: address,
            city: city,
            state: state,
            zip: zip
        }
        ApiHelper.postAnonymous("/donate/checkout", data, "GivingApi").then((resp: any) => {
            stripe.redirectToCheckout({ sessionId: resp.sessionId });
        });
        //}
    }


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        switch (e.target.name) {
            case "name": setName(e.target.value); break;
            case "address": setAddress(e.target.value); break;
            case "city": setCity(e.target.value); break;
            case "state": setState(e.target.value); break;
            case "zip": setZip(e.target.value); break;
            case "amount": setAmount(parseInt(e.target.value, 0)); break;
        }
    }


    return (
        <>
            <InputBox headerIcon="" headerText="Donate with Card" saveFunction={handleDonate} saveText="Donate" >

                <FormGroup>
                    <FormControl name="name" type="text" value={name} onChange={handleChange} placeholder="Name" />
                </FormGroup>
                <FormGroup>
                    <FormControl name="address" type="text" value={address} onChange={handleChange} placeholder="Address" />
                </FormGroup>

                <Row>
                    <Col xl={6}>
                        <FormGroup>
                            <FormControl name="city" type="text" value={city} onChange={handleChange} placeholder="City" />
                        </FormGroup>
                    </Col>
                    <Col xl={3}>
                        <FormGroup>
                            <FormControl name="state" type="text" value={state} onChange={handleChange} placeholder="State" />
                        </FormGroup>
                    </Col>
                    <Col xl={3}>
                        <FormGroup>
                            <FormControl name="zip" type="text" value={zip} onChange={handleChange} placeholder="Zip" />
                        </FormGroup>
                    </Col>
                </Row>
                <FormGroup>
                    <InputGroup>
                        <InputGroup.Prepend><InputGroup.Text>$</InputGroup.Text></InputGroup.Prepend>
                        <FormControl name="amount" value={amount} onChange={handleChange} placeholder="Amount" type="number" min="5.00" step="1" />
                        <InputGroup.Append><InputGroup.Text>.00</InputGroup.Text></InputGroup.Append>
                    </InputGroup>
                </FormGroup>
            </InputBox>
        </>
    );
}