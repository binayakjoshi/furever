export default function AuthCard() {
    return (
      <Container>
        <Wrapper>
          <Card>
            <CardHeader>
              <CardTitle>Welcome Back</CardTitle>
              <CardDescription>Login to your account</CardDescription>
            </CardHeader>
  
            <CardContent>
              {/* Form Fields Here */}
              <LinksContainer>
                <ForgotLink href="#">Forgot Password?</ForgotLink>
              </LinksContainer>
  
              <DividerWrapper>
                <Divider>
                  <DividerText>or continue with</DividerText>
                </Divider>
              </DividerWrapper>
  
              <SignupButton variant="outlined">
                <SignupIcon>🔒</SignupIcon> Sign in with Google
              </SignupButton>
            </CardContent>
          </Card>
        </Wrapper>
      </Container>
    );
  }

