const editData = `
<html lang="en"><head><style>
  ::-webkit-scrollbar {
    width: 4px;
    height: 4px;
  }
  ::-webkit-scrollbar-track {
    border-radius: 12px;
  }
  ::-webkit-scrollbar-thumb {
    background: lightgray;
    border-radius: 12px;
  }
</style>


<meta charset="utf-8">
<meta content="width=device-width, initial-scale=1.0" name="viewport">
<title>CAMZYOS Email Template</title>
<style>
    /* Reset styles */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: Arial, sans-serif;
      line-height: 27px;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
    }

    /* Header styles */
    .header-banner {
      background: linear-gradient(90deg, #4a3d69 0%, #b3855f 50%, #4a3d69 100%);
      height: 60px;
      width: 100%;
      margin-bottom: 20px;
    }

    /* Logo container */
    .logo-container {
      text-align: right;
      /* padding: 20px; */
    }

    .logo {
      max-width: 200px;
      height: auto;
    }

    /* Content styles */
    .content {
      padding: 20px;
    }

    .greeting {
      font-size: 16px;
      margin-bottom: 20px;
    }

    .main-text {
      margin-bottom: 30px;
    }

    /* Module styles */
    .module {
      border: 1px dashed #ffd1b3;
      padding: 10px;
      margin: 12px 0;
      border-radius: 5px;
      background-color: #fff9f5;
    }

    .module-header {
      display: inline-block;
      font-size: small;
      background-color: #ffe4d1;
      padding: 5px 15px;
      border-radius: 3px;
      margin-right: 10px;
    }

    /* Rating system */
    .rating {
      text-align: center;
      margin: 40px 0;
    }

    .rating-title {
      margin-bottom: 20px;
      font-size: 18px;
    }

    .stars {
      display: flex;
      justify-content: center;
      gap: 20px;
    }

    .star {
      color: #ccc;
      font-size: 24px;
    }

    .star-number {
      display: block;
      font-size: 14px;
      margin-top: 5px;
      color: #666;
    }

    /* Footer styles */
    .footer {
      /* padding: 20px 40px; */
      font-size: 14px;
      line-height: 1.8;
      color: #333;
      /* text-align: justify; */
      margin-top: 20px;
      background-color: #fff;
    }

    .footer p {
      margin-bottom: 15px;
    }

    .footer-links {
      display: flex;
      justify-content: center;
      gap: 20px;
      margin: 20px 0;
    }

    .footer-links a {
      color: #4a3d69;
      text-decoration: none;
    }

    .footer a:hover {
      text-decoration: underline;
    }

    .footer-contact {
      text-align: center;
      margin: 15px 0;
      font-size: 13px;
    }

    .footer-id {
      text-align: center;
      color: #666;
      font-size: 12px;
      margin-top: 15px;
    }

    /* Dynamic content placeholders */
    .placeholder {
      color: #666;
      background-color: #f9f9f9;
      padding: 10px;
      margin: 10px 0;
      border: 1px solid #eee;
    }

    .placeholder-head {
      color: #666;
      background-color: #f9f9f9;
      padding: 10px;
      margin: 10px 0;
      border: 1px solid #eee;
    }

    .hero-placeholder {
      background: #f0f4f8;
      height: 150px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px dashed #cbd5e0;
      margin: 0 0 10px 0;
      border-radius: 4px;
    }

    /* Signature block */
    .signature {
      margin: 30px 0;
    }

    /* References section */
    .references {
      margin-top: 20px;
      /* padding-top: 20px; */
    }
  </style>
</head>
<body style="
max-width: 600px;
font-size: 16px;
">
<div class="references" style="
  /* background-color: #9e9e9e; */
  padding: 14px 0px;
">
<div id="subject_line">Subject Line: Exciting Updates on CAMZYOS® Efficacy</div>
<div id="preview">Preheader: Discover the impressive results of CAMZYOS® in improving cardiac function and reducing LVOT gradients.</div>
</div>
<div class="logo-container">
<img alt="Brand Logo" class="logo" src="https://devkraftgenai.s3.ap-south-1.amazonaws.com/newton/templates/Camzyos_logo.png">
</div>
<div>
<div id="hero_image"><img alt="" src="https://devkraftgenai.s3.amazonaws.com/dev/newton/fa8ab4a9-c3a8-43da-855c-ae58fbf05f76.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&amp;X-Amz-Credential=AKIAW2NDCY2FLUNY47MV%2F20250407%2Fap-south-1%2Fs3%2Faws4_request&amp;X-Amz-Date=20250407T070438Z&amp;X-Amz-Expires=604800&amp;X-Amz-SignedHeaders=host&amp;X-Amz-Signature=fe7be07a517b527aeeeed87c2e9d6a5b964841aa5d840e9bc98664da94243ae1" style="width: 100%;" width=""></div>
<div class="greeting">Dear {{customText(50)}}</div>
<div id="intro">I wanted to take a moment to share some exciting information about CAMZYOS® that I believe will be of interest to you.</div>
<div id="module"><div style="margin: 12px 0px;">
<div style="color: black; font-size: 17px; margin-bottom: 15px; font-weight: 900; border-bottom: 1px solid red; padding-bottom: 7px; text-align: justify;">
        EXPLORER-HCM: Treatment with CAMZYOS®, a first-in-class cardiac myosin inhibitor, was superior to placebo for all primary and secondary endpoints.<sup>1</sup>
</div>
<ul style="list-style-type: disc; padding-left: 8px;">
<li style="color: black; font-family: Arial; font-size: 16px; line-height: 27px; text-align: start; margin-bottom: 5px;">
            CAMZYOS® demonstrated significant efficacy in improving primary endpoints compared to placebo.
        </li>
<li style="color: black; font-family: Arial; font-size: 16px; line-height: 27px; text-align: start; margin-bottom: 5px;">
            The treatment resulted in higher pCR rates, enhancing clinical outcomes.
        </li>
<li style="color: black; font-family: Arial; font-size: 16px; line-height: 27px; text-align: start; margin-bottom: 5px;">
            Adverse effects were manageable and consistent with known profiles.
        </li>
<li style="color: black; font-family: Arial; font-size: 16px; line-height: 27px; text-align: start; margin-bottom: 5px;">
            CAMZYOS® could redefine treatment approaches for patients with specific cardiac conditions.
        </li>
</ul>
</div><div style="margin: 12px 0px;">
<div style="color: black; font-size: 17px; margin-bottom: 15px; font-weight: 900; border-bottom: 1px solid red; padding-bottom: 7px; text-align: justify;">
        EXPLORER-HCM: Summary of safety through Week 30 (treatment period)<sup>2</sup>
</div>
<ul style="list-style-type: disc; padding-left: 8px;">
<li style="color: black; font-family: Arial; font-size: 16px; line-height: 27px; text-align: start; margin-bottom: 5px;">
            Camzyos® demonstrates a favorable safety profile through Week 30 of the treatment period.
        </li>
<li style="color: black; font-family: Arial; font-size: 16px; line-height: 27px; text-align: start; margin-bottom: 5px;">
            A significant number of patients experienced adverse events, mostly manageable.
        </li>
<li style="color: black; font-family: Arial; font-size: 16px; line-height: 27px; text-align: start; margin-bottom: 5px;">
            Serious adverse events were relatively low, indicating good tolerability.
        </li>
<li style="color: black; font-family: Arial; font-size: 16px; line-height: 27px; text-align: start; margin-bottom: 5px;">
            Treatment-related discontinuations were minimal, reflecting solid patient adherence to the regimen.
        </li>
</ul>
</div><div style="margin: 12px 0px;">
<div style="color: black; font-size: 17px; margin-bottom: 15px; font-weight: 900; border-bottom: 1px solid red; padding-bottom: 7px; text-align: justify;">
        Patients given CAMZYOS® showed rapid and sustained improvement in resting LVOT gradients compared with placebo<sup>1</sup>
</div>
<ul style="list-style-type: disc; padding-left: 8px;">
<li style="color: black; font-family: Arial; font-size: 16px; line-height: 27px; text-align: start; margin-bottom: 5px;">
            CAMZYOS® significantly reduced resting LVOT gradients compared to placebo in clinical assessments.
        </li>
<li style="color: black; font-family: Arial; font-size: 16px; line-height: 27px; text-align: start; margin-bottom: 5px;">
            Patients receiving CAMZYOS® demonstrated rapid improvements in cardiac function metrics.
        </li>
<li style="color: black; font-family: Arial; font-size: 16px; line-height: 27px; text-align: start; margin-bottom: 5px;">
            Sustained benefits in LVOT gradients were observed over the treatment duration with CAMZYOS®.
        </li>
<li style="color: black; font-family: Arial; font-size: 16px; line-height: 27px; text-align: start; margin-bottom: 5px;">
            The therapeutic effects of CAMZYOS® surpassed those of placebo, indicating enhanced efficacy.
        </li>
</ul>
</div></div>
<div id="closing">If you're interested in learning more about CAMZYOS® or have any inquiries, please don’t hesitate to reach out. I look forward to assisting you!</div>
<br>


<div>{Best Regards}</div>
<div>{{userName}} {{User.Credentials_}}</div>
<div>
<!-- <a href="mailto:%7B%7BuserEmailAddress%7D%7D" target="_blank" class="signLink"
            id="link-8"> -->{{userEmailAddress}}<!-- </a> -->
</div>
<div>{{User.MobilePhone}}</div>
<!-- <div><a href="https://www.boehringer-ingelheim.com?cust_id=%7B%7BAccount.Id%7D%7D" target="_blank"
            class="biLink" id="link-10"><b>www.boehringer-ingelheim.com</b></a><br></div> -->


<div class="references" style="border-top: 1px solid #eee;">
<div id="footnotes">
<div style="padding-left: 4px;">HCM, hypertrophic cardiomyopathie; LVOT, left ventricular outflow tract</div>
</div>
<div id="reference">
<div style="color: #34495e; font-size: 20px;margin-top: 4px; margin-bottom: 16px; text-align: start;">
  References
</div>
<div style="padding-left: 15px;">
<ol style="list-style-type: decimal; padding-left: 20px;">
<li style="color: black; font-family: Arial; font-size: 14px; line-height: 18px; text-align: start; margin-bottom: 5px;">
      Olivotto I et al. Lancet. 2020;396:759–769.
    </li>
<li style="color: black; font-family: Arial; font-size: 14px; line-height: 18px; text-align: start; margin-bottom: 5px;">
      Olivotto I et al. Lancet 2020;396:759–769. Table adapted from Olivotto I et al. Lancet 2020;396:759–769.
    </li>
</ol>
</div>
</div>
</div>
<div style="background-color: #130D2F; height: 2px; width: 100%; margin: 20px 0;"></div>
<div style="text-align: right; margin-bottom: 20px;">
<img alt="Camzyos Logo" src="https://devkraftgenai.s3.ap-south-1.amazonaws.com/newton/templates/Camzyos_logo.png" style="max-width: 150px; height: auto;">
</div>
<footer class="footer" style="text-align: justify; font-size: 16px; line-height: 1.6;">
<p style="margin-bottom: 20px;">
<strong>CAMZYOS®</strong>(mavakamten) 2.5 mg, 5 mg, 10 mg, 15 mg, hard capsules. Agents for heart disease, Other
        agents for heart disease, ATC code: C01EB24
        <br>
<strong>Indication:</strong>CAMZYOS® is indicated for the treatment
        of symptomatic (New York Heart Association, NYHA, functional class II–III) obstructive hypertrophic
        cardiomyopathy (oHCM) in adults.
        <br>
<strong>Contraindication:</strong>During pregnancy and to fertile women who do
        not use an effective contraceptive method. Concomitant treatment with strong CYP3A4 inhibitors in patients with
        the CYP2C19 slow metaboliser phenotype and undetermined CYP2C19 phenotype. Concomitant treatment with the
        combination of a strong CYP2C19 inhibitor and a strong CYP3A4 inhibitor.
        <br>
<strong>Warnings and Precautions:</strong>Systolic dysfunction defined as symptomatic left ventricular ejection fraction (LVEF)
        &amp;lt; 50%: Gastric chamber decreases LVEF and may cause heart failure due to systolic dysfunction defined as
        symptomatic LVEF &amp;lt; 50%. LVEF should be measured before treatment is initiated and closely monitored
        thereafter. Treatment interruption may be necessary to ensure LVEF remains ≥ 50%. Heart failure risk or lack of
        response to mavacamten due to interactions: Mavacamten is metabolized primarily by CYP2C19 and to a lesser
        extent by CYP3A4, and primarily by CYP3A4 in poor CYP2C19 metabolizers. Interactions with these enzymes can both
        lead to non-response to gastric emptying and increased risk of heart failure due to systolic dysfunction. Before
        and during mavakamten treatment, the risk of interactions with other medicines, including non-prescription ones,
        must be assessed. Embryo-foetal toxicity: Based on animal studies, mavacamten is suspected of causing
        embryo-foetal toxicity when administered to a pregnant woman. Before starting treatment, women of childbearing
        potential must be informed of this risk to the fetus, take a negative pregnancy test and use an effective method
        of contraception during treatment and for 6 months after stopping
        treatment.
        <br>
<strong>Interactions:</strong>Pharmacodynamic Interactions: If therapy with a negative inotrope is
        instituted, or if the dose of a negative inotrope is increased in a patient on a supine position, close medical
        review with monitoring of LVEF should occur until stable doses and clinical response are achieved.
        Pharmacokinetic interactions: In intermediate, normal, rapid and ultra-rapid CYP2C19 metabolizers, mavacamten is
        metabolized primarily by CYP2C19 and to a lesser extent by CYP3A4. For CYP2C19 slow metabolizers, metabolism
        occurs primarily via CYP3A4. Thus, CYP2C19 inhibitors/inducers and CYP3A4 inhibitors/inducers can affect
        mavacamten clearance and increase/decrease the plasma concentration of mavacamten, and this is dependent on
        CYP2C19 phenotype.
        <br>
<strong>Packaging:</strong>28 hard capsules.
        <br>
<strong>Other information:</strong>CAMZYOS® is
        prescription, Rx, not eligible for benefits, EF. For complete information and price, see <a href="https://www.fass.se" style="color: #3e3c3c;" target="_blank">www.fass.se</a>. The text
        is based on the product summary August 4, 2023. Bristol Myers Squibb, tel. 08-704 71 00, <a href="https://www.bms.com/se" style="color: #3e3c3c;" target="_blank">www.bms.com/se</a>.
      </p>
<p style="text-align: center; margin-bottom: 30px;">© <span id="year">2025</span> MyoKardia, Inc., a Bristol Myers Squibb company.CAMZYOS® and the CAMZYOS Logo are trademarks of MyoKardia, Inc.</p>
<div style="text-align: center; margin-bottom: 30px;">
<img alt="Bristol Myers Squibb" src="https://devkraftgenai.s3.ap-south-1.amazonaws.com/newton/templates/Screenshot+2024-12-17+at+3.50.09%E2%80%AFPM.png" style="max-width: 200px;">
</div>
<div style="text-align: center; margin-bottom: 20px;">
<a href="https://www.camzyos.com/" style="color: #666; text-decoration: none; margin: 0 15px;" target="_blank">camzyos.com</a>
<a href="https://www.camzyos.com/taking-camzyos/safety-and-side-effects" style="color: #666; text-decoration: none; margin: 0 15px;" target="_blank">Side effects/complaints</a>
</div>
<p style="text-align: center; margin-bottom: 10px;">You are receiving this letter because you have chosen to
        subscribe to newsletters from BMS.<br>Your privacy is important to us - read more about how we process your
        personal data this spring <a href="https://www.bms.com/gb/privacy-policy.html" style="color: #666; text-decoration: underline;" target="_blank">privacy policy</a>
<br></p>
<p style="text-align: center; margin-bottom: 10px;">Do you want to unsubscribe?<span style="color: #666; text-decoration: underline;">Unregister here</span>
</p>
<p style="text-align: center; margin-bottom: 10px;">Bristol Myers Squibb Tel. 08-704 71 00, www.bms.com</p>
<p style="text-align: center; color: #666; margin-top: 20px;">3500-SE-2400005<span id="dynamicDate">APRIL2025</span></p>
</footer>
</div>

<script>
  document.getElementById("year").textContent = new Date().getFullYear();
</script>
<script>
  // Get current month and year
  const date = new Date();
  const monthNames = [
      "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", 
      "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
  ];
  
  const currentMonth = monthNames[date.getMonth()]; // Get current month in uppercase
  const currentYear = date.getFullYear(); // Get current year

  // Update the span with the dynamic month and year
  document.getElementById("dynamicDate").textContent = currentMonth + currentYear;
</script>
</body></html>

`

export default editData
