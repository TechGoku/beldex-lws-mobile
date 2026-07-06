import { Box, Typography, useMediaQuery } from '@mui/material';
import { useTheme } from "@emotion/react";
const Privacy = () => {
  const theme: any = useTheme();
  const isMobileMode = useMediaQuery(theme.breakpoints.down("sm"));
  return (
    <Box
      className="appWrapper"
      sx={{
        minWidth: isMobileMode ? "100%" : "calc(100% - 250px)",
        background: isMobileMode ? "unset" : theme.palette.background.paper,
        borderRadius: "25px",
      }}
    >
      <Box sx={{ height: "calc(100vh - 107px)", overflowY: "auto" }}>
        <Typography sx={{ color: theme.palette.text.primary, fontSize: '20px', fontWeight: 700, margin: '40px 40px 25px', textAlign: 'center' }}>Privacy</Typography>
        <Box sx={{ color: theme.palette.text.primary, fontSize: '20px', margin: isMobileMode ? "0" : '40px 40px 25px', }}>
          <Typography>
            Please read through this Privacy Policy carefully as it may affect your rights and it also helps you understand how much we value the privacy of your data.                </Typography>
          <Typography sx={{ marginTop: '20px' }}>
            Last Updated: 6 Feb 2023
          </Typography>
          <Typography sx={{ color: theme.palette.text.primary, marginTop: '20px', fontWeight: 700 }}>
            1. Introduction
          </Typography>
          <Typography>
            This Privacy Policy explains how information and data about you is collected, used and disclosed by Beldex and its group companies ("we" or "us"). This Privacy Policy (together with our Terms of Service and any other documents referred to in this document or the Terms of Service) applies to information we collect when you use our websites, mobile applications, hosted Beldex accounts and other online products and services (collectively, the "Services") or when you otherwise interact with us.
          </Typography>
          <Typography sx={{fontSize:'14px'}}>
            We may change this Privacy Policy from time to time. If we make changes, we will notify you by changing the “Last Updated” date at the top of this page and, in some cases, we may provide you with additional notice by adding a statement to our blog page on Medium, social media accounts or sending you push notifications on your device. Unfortunately, because we don’t store your details (see below for exactly what we do and don’t store), we can’t notify you of any changes via email. Therefore, we encourage you to review the Privacy Policy whenever you access the Services to stay informed about our information practices and the ways you can join us in protecting your privacy.
          </Typography>
          <Typography sx={{ marginTop: '20px', fontWeight: 700, color: theme.palette.text.primary }}>
            2. Collection of Information
          </Typography>
          <Typography>
            Information you provide to us - We collect information you provide directly to us. When opening a wallet, you’ll notice that you will provide literally no information directly to us so this usually relates to communications between you and our support teams or for any once-off interactive features (in these circumstances, we will usually explain exactly how that information will be used so don’t worry).
          </Typography>
          <Typography sx={{ marginTop: '20px' }}>
            Information we collect automatically when you use the Services - When you access or use our Services, we automatically collect information about you, including:
            <Typography component={'ul'}>
              <Typography component={'li'}>
                Your wallet’s public address and view key- your private key, mnemonic seed and all the really important wallet information is yours to protect and we will never have access to it.
              </Typography>
              <Typography component={'li'}>
                The last date on which your wallet is accessed.
              </Typography>
              <Typography component={'li'}>
                The subdomain of the API from which the Services are accessed (where access is made via an API).                        </Typography>
              <Typography component={'li'}>
                When an error occurs, we collect information about the error (such as the date and error type) and we also log information about the type of device, browser and operating system you were using at the time of the error in the form of your user agent but, in circumstances in which there isn’t an error, this information will not be collected.                        </Typography>
            </Typography>
          </Typography>
          <Typography sx={{ marginTop: '20px' }}>
            Information we do not collect – Because we care about your privacy, there is some information which we have deliberately designed our systems not to collect, including:
            <Typography component={'ul'}>
              <Typography component={'li'}>
                IP Address - We do not actively track or collect the IP from which you access the Services- that’s your business.
              </Typography>
              <Typography component={'li'}>
                Log Information - Information about your use of the Services, including the type of browser you use, access times, pages viewed, pages you visited before navigating to our websites etc... As stated above, some of this information such as the type of browser or operating system you’re using will be logged but only in circumstances in which an error occurs.
              </Typography>
              <Typography component={'li'}>
                Device Information - Information about the mobile device you use to access our mobile application, including the hardware model, operating system and version, unique device identifiers and mobile network information. Again, when an error occurs we log the type of device and operating system but in normal, error-free use, our system won’t log any of it.
              </Typography>
              <Typography component={'li'}>
                Information Collected by Cookies and Other Tracking Technologies - Cookies are small data files stored on your hard drive or in device memory that are used to track your usage of websites and other online tools often for purposes of monitoring and maintenance but we don’t use them. Regardless, you are always welcome to disable the use of cookies on your browser to make absolutely certain there isn’t anyone watching.
              </Typography>
              <Typography component={'li'}>
                Account Address Information: Again, all we store is your public address and view key; we will never store or know your private spend key or mnemonic seed which means that it is cryptographically impossible for us to spend funds on your behalf or access your wallet.
              </Typography>
            </Typography>
          </Typography>
          <Typography sx={{ marginTop: '20px', fontWeight: 700, color: theme.palette.text.primary }}>
            3. Use of Information
          </Typography>
          <Typography>
            We may use the little information we collect for various purposes, including to:
            <Typography component={'ul'}>
              <Typography component={'li'}>
                Provide, maintain and improve our Services.
              </Typography>
              <Typography component={'li'}>
                Provide and deliver the services you specifically request and send you related information regarding those requests.
              </Typography>
              <Typography component={'li'}>
                Respond to your comments, questions and requests and provide customer service.
              </Typography>
              <Typography component={'li'}>
                Monitor and analyze trends, usage and activities in connection with our Services in an aggregate and anonymous manner.
              </Typography>
              <Typography component={'li'}>
                Process and deliver contest entries, rewards or results through specifically designed interactive features.
              </Typography>
              <Typography component={'li'}>
                Carry out any other purpose for which you provided the information (such purposes will be explained wherever we need to collect any new information not outlined above).
              </Typography>
            </Typography>
          </Typography>
          <Typography sx={{ marginTop: '20px', fontWeight: 700, color: theme.palette.text.primary }}>
            4. Sharing of Information
          </Typography>
          <Typography>
            We may share the little information collect about you in the following ways:
            <Typography component={'ul'}>
              <Typography component={'li'}>
                With the Beldex Network, we will share your public account address and any transaction details to facilitate any transaction request you submit via the Services.
              </Typography>
              <Typography component={'li'}>
                With vendors, consultants and other service providers who need access to such information to carry out work on our behalf. Note that it is our standard practice to require all of our vendors and contractors to handle your information in accordance with this Privacy Policy and that they would not be provided any additional information other than the information outlined above. Furthermore, access to our databases is severely restricted even within the company so third party service providers will never be given access to the public addresses and view keys we store.
              </Typography>
              <Typography component={'li'}>
                In response to an official request for information by a regulator or body with legitimate jurisdiction provided that we are satisfied that the disclosure is required by any applicable law, regulation or legal process.
              </Typography>
              <Typography component={'li'}>
                If we believe your actions are inconsistent with the spirit or language of our user agreements or policies, or to protect the rights, property and safety of us or others.
              </Typography>
              <Typography component={'li'}>
                In connection with, or during negotiations of, any merger, sale of our assets, financing or acquisition of all or a portion of our business to another company but, as with our vendors and contractors, we will ensure that this information is protected in accordance with this Privacy Policy and that no additional information is collected for these purposes without amendment to this Privacy Policy. Note that we keep our database of public addresses and view keys only for the proper operation of the Services and we do not consider them an asset of ours to sell. Because of this, we will ensure that any prospective merger partner or acquirer of our Services will be restricted from accessing these databases until such a time and in such a manner in which such access is necessary for the continued operation of the Services.
              </Typography>
              <Typography component={'li'}>
                With your consent or at your direction, including if we notify you through our Services that the information you provide will be shared in a particular manner and you provide such information.
              </Typography>
            </Typography>
          </Typography>
          <Typography>
            But note that, as far as possible, any information we share will be aggregated or de-identified information which cannot reasonably be used to identify you.
          </Typography>
          <Typography sx={{ marginTop: '20px', fontWeight: 700, color: theme.palette.text.primary }}>
            5. Security
          </Typography>
          <Typography>
            As users of our own Services, we take its security very seriously and ensure that we apply reasonable measures to help protect information about you from loss, theft, misuse, unauthorized access, disclosure, alteration and destruction. However, as we do not collect the most important information about you and your use of the Services, the security of your information is also in your hands and we recommend that you take this as seriously as we do.
          </Typography>
          <Typography sx={{ marginTop: '20px', fontWeight: 700, color: theme.palette.text.primary }}>
            6. Your Rights in Relation to Your Information
          </Typography>
          <Typography>
            Whether you know it or not, you have the following rights in relation to your information which we collect:
            <Typography component={'ul'}>
              <Typography component={'li'}>
                Right to Access – You have the right to request copies of the information we hold about you at any time. If we provide you with access to the information we hold about you, we will not charge you unless your request is "manifestly unfounded or excessive." Where we are legally permitted to do so, we may refuse your request and if we do so, we will tell you the reasons for such refusal.
              </Typography>
              <Typography component={'li'}>
                Right to Correct – You have the right to have your information rectified where it is inaccurate or incomplete.
              </Typography>
              <Typography component={'li'}>
                Right to Erase – You have the right to request that we delete or remove your information from our systems.
              </Typography>
              <Typography component={'li'}>
                Right to Restrict Our Use of Your Information – You have the right to "block" us from using your information or limit the way in which we can use it.
              </Typography>
              <Typography component={'li'}>
                Right to Data Portability – You have the right to request that we move, copy or transfer your information.
              </Typography>
              <Typography component={'li'}>
                Right to Object – You have the right to object to our use of your information including where we use it for our legitimate interests.                        </Typography>

            </Typography>
          </Typography>
          <Typography>
            It is important to remember that, because we collect so little data on you, it will often be difficult to identify which information is yours which could make the exercise of any of the above rights impossible in the circumstances.
          </Typography>
          <Typography sx={{ marginTop: '20px', fontWeight: 700, color: theme.palette.text.primary }}>
            7. Contact Us
          </Typography>
          <Typography>
            If you have any questions about this Privacy Policy or wish to exercise any of your rights, please contact us at support@beldex.io
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

export default Privacy;