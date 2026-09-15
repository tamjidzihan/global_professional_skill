# Global Professional Institute (GPI) Certificate Design Specification

This document provides a portable, self-contained reference for the **A4 Landscape Academic/Professional Certificate Design**. You can copy and reuse these design tokens, Tailwind CSS / Vanilla CSS components, and export utilities across any web or React project.

---

## 1. Design Overview & Specifications

- **Format / Orientation**: A4 Landscape (`297mm × 210mm` / Standard Render: `1120px × 792px`, aspect ratio `297 / 210` or `1.414:1`).
- **Design Theme**: Classic Academic Prestige (Deep Navy `#102f52`, Royal Gold `#c79b43` / `#bd9144` / `#a87929`, Crisp White canvas with subtle central radial parchment glow).
- **Key Visual Elements**:
  - **Outer Border**: Navy background with inset 2px gold border and outer dark frame.
  - **Inner Border**: Gold border with inset 1px navy border and corner ornaments (`❧`).
  - **Watermark**: Centered translucent institute logo (`opacity: 10%`).
  - **Header**: Logo, Institution Name in classic serif, Gold Certificate Title with star accent divider.
  - **Main Content**: Dynamic recipient name with underline, examination/course title, commendation text, and formatted award date.
  - **Seal**: 24-point scalloped star badge constructed with CSS `clip-path: polygon(...)`, concentric golden shadow rings, graduation cap icon, and institute acronym.
  - **Barcode**: Code 128 dynamic barcode generated from the unique certificate serial number.
  - **Signature**: Instructor / Authorized Signatory line with serif label.
  - **Footer**: Three-column metadata bar (Website, Email, Mobile) separated by vertical dividers.

---

## 2. Color Palette & Typography

### Color Palette

| Role | Hex Code | Description |
| :--- | :--- | :--- |
| **Primary Dark / Navy** | `#102f52` / `#102e57` / `#172f55` | Outer border frame, institution title, icons |
| **Primary Gold / Accent** | `#c79b43` / `#c99b3d` / `#a87929` | Borders, certificate title, decorative elements |
| **Gold Highlight** | `#bd9144` / `#e0b64f` / `#f0d178` | Seal gradient, title stars, divider lines |
| **Dark Seal Base** | `#a87513` / `#a8730c` / `#c69625` | Conic gradient base and seal ring shadows |
| **Text Primary** | `#17243a` / `#202020` / `#161616` | Recipient name, course title, body text |
| **Text Muted / Subtitle** | `#282828` / `#292929` / `#252525` | "This is to certify that", commendation text |
| **Footer Text** | `#233450` | Footer contact info |
| **Canvas Background** | `#ffffff` | Certificate base |
| **Canvas Parchment Glow**| `rgba(224, 218, 198, 0.08)` | Subtle central radial gradient |

### Typography

- **Serif (Headings & Body)**: `Georgia, "Times New Roman", Times, serif` (`font-serif` in Tailwind).
- **Sans-Serif (Barcode & Seal Acronym)**: `Arial, Helvetica, sans-serif` (`font-sans` in Tailwind).

---

## 3. Reusable React + Tailwind CSS Component

Install dependencies:
```bash
npm install jsbarcode
npm install -D @types/jsbarcode
```

```tsx
// Certificate.tsx
import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

export interface CertificateData {
    studentName: string;
    examinationName: string;
    issueDate: string; // Format: YYYY-MM-DD
    serialNumber: string;
    website: string;
    email: string;
    mobile: string;
    logoUrl?: string;
}

interface CertificateProps {
    data: CertificateData;
}

export const Certificate = ({ data }: CertificateProps) => {
    const barcodeRef = useRef<SVGSVGElement | null>(null);
    const logoSrc = data.logoUrl || "/gpilogo_icon.png";

    useEffect(() => {
        if (!barcodeRef.current || !data.serialNumber) return;

        try {
            JsBarcode(barcodeRef.current, data.serialNumber, {
                format: "CODE128",
                width: 2,
                height: 55,
                displayValue: false,
                margin: 0,
                background: "transparent",
                lineColor: "#111111",
            });
        } catch (error) {
            console.error("Barcode rendering failed:", error);
        }
    }, [data.serialNumber]);

    return (
        <div className="w-[min(100%,1120px)] [aspect-ratio:297/210] relative shrink-0">
            {/* The element with id="certificate" is captured for PDF generation */}
            <div
                id="certificate"
                className="w-[1120px] h-[792px] relative bg-white origin-top-left select-none overflow-hidden"
            >
                {/* 1. WATERMARK */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[75%] h-[75%] flex justify-center items-center pointer-events-none z-[1]">
                    <img
                        src={logoSrc}
                        alt="Watermark"
                        className="w-full h-full object-contain opacity-10"
                    />
                </div>

                {/* 2. OUTER DECORATIVE BORDER */}
                <div className="absolute inset-0 p-[10px] bg-[#102f52] border border-[#0b2038] before:content-[''] before:absolute before:inset-[4px] before:border-2 before:border-[#c99b3d] before:pointer-events-none">
                    
                    {/* 3. INNER BORDER */}
                    <div className="w-full h-full relative p-[13px] bg-white border-2 border-[#c79b43] before:content-[''] before:absolute before:inset-[5px] before:border before:border-[#172e4e] before:pointer-events-none">
                        
                        {/* 4. PARCHMENT CONTENT CANVAS */}
                        <div className="w-full h-full relative overflow-hidden bg-[radial-gradient(circle_at_center,rgba(224,218,198,0.08),transparent_48%),#ffffff]">
                            
                            {/* CORNER ORNAMENTS */}
                            <div className="w-[70px] h-[70px] absolute z-[5] text-[#b48a43] font-serif text-[65px] leading-none pointer-events-none top-[7px] left-[8px]">
                                <span className="block -rotate-[10deg]">❧</span>
                            </div>

                            <div className="w-[70px] h-[70px] absolute z-[5] text-[#b48a43] font-serif text-[65px] leading-none pointer-events-none top-[7px] right-[8px] scale-x-[-1]">
                                <span className="block">❧</span>
                            </div>

                            <div className="w-[70px] h-[70px] absolute z-[5] text-[#b48a43] font-serif text-[65px] leading-none pointer-events-none bottom-[7px] left-[8px] scale-y-[-1]">
                                <span className="block">❧</span>
                            </div>

                            <div className="w-[70px] h-[70px] absolute z-[5] text-[#b48a43] font-serif text-[65px] leading-none pointer-events-none right-[8px] bottom-[7px] rotate-180">
                                <span className="block">❧</span>
                            </div>

                            {/* HEADER */}
                            <header className="relative text-center pt-[22px] z-[2]">
                                <div className="w-[120px] h-[120px] mx-auto mb-[5px] flex justify-center items-center">
                                    <img
                                        src={logoSrc}
                                        alt="Logo"
                                        className="w-full h-full object-contain"
                                    />
                                </div>

                                <h1 className="mt-[2px] mb-0 font-serif text-[29px] font-bold tracking-[0.4px] text-[#102e57]">
                                    GLOBAL PROFESSIONAL INSTITUTE
                                </h1>

                                <h2 className="mt-[18px] mb-[2px] font-serif text-[43px] leading-[1.1] font-normal tracking-[1px] text-[#a87929]">
                                    CERTIFICATE OF ACHIEVEMENT
                                </h2>

                                <div className="w-[180px] mx-auto mt-[5px] flex items-center justify-center gap-[7px]">
                                    <span className="h-[1px] flex-1 bg-[#bd9144]" />
                                    <b className="text-[#bd9144] text-[14px]">✦</b>
                                    <span className="h-[1px] flex-1 bg-[#bd9144]" />
                                </div>
                            </header>

                            {/* MAIN CONTENT */}
                            <main className="relative z-[2] text-center mt-[16px]">
                                <p className="m-0 font-serif text-[19px] text-[#292929]">
                                    This is to certify that
                                </p>

                                <div className="min-h-[47px] my-[9px_2px] mx-auto w-[62%] px-[10px] pb-[5px] font-serif text-[30px] font-semibold text-[#17243a] whitespace-nowrap overflow-hidden text-ellipsis">
                                    {data.studentName || "Student Name"}
                                </div>

                                <div className="w-[63%] h-[1px] mx-auto mb-[15px] bg-[#1b1b1b]" />

                                <p className="m-0 font-serif text-[17px] text-[#282828]">
                                    has successfully passed the examination in
                                </p>

                                <div className="w-[55%] min-h-[33px] mt-1 mx-auto pb-[3px] border-b border-[#222] font-serif text-[21px] font-semibold text-[#202020] whitespace-nowrap overflow-hidden text-ellipsis">
                                    {data.examinationName || "Examination Name"}
                                </div>

                                <p className="mt-2 mb-0 font-serif text-[17px] text-[#282828]">
                                    conducted by Global Professional Institute.
                                </p>

                                <p className="mt-[10px] mb-0 font-serif text-[17px] text-[#282828]">
                                    We commend the dedication and hard work demonstrated.
                                </p>

                                <p className="mt-[14px] mb-0 font-serif text-[16px] text-[#282828]">
                                    Awarded on this{" "}
                                    <span className="inline-block min-w-[45px] px-[5px] pb-[2px] border-b border-[#444]">
                                        {formatDay(data.issueDate)}
                                    </span>{" "}
                                    day of{" "}
                                    <span className="inline-block min-w-[45px] px-[5px] pb-[2px] border-b border-[#444]">
                                        {formatMonth(data.issueDate)}
                                    </span>
                                    ,{" "}
                                    <span className="inline-block min-w-[45px] px-[5px] pb-[2px] border-b border-[#444]">
                                        {formatYear(data.issueDate)}
                                    </span>
                                    .
                                </p>
                            </main>

                            {/* BOTTOM SECTION */}
                            <section className="absolute left-[48px] right-[48px] bottom-[77px] h-[105px] grid grid-cols-[1fr_160px_1fr] items-center z-[3]">
                                {/* LEFT: SERIAL & BARCODE */}
                                <div className="self-end text-left">
                                    <div className="mb-[6px] font-sans text-[13px] font-medium text-[#161616]">
                                        <strong className="font-[750]">Serial Number:</strong>{" "}
                                        {data.serialNumber || "GPI-PASS-2026-000001"}
                                    </div>

                                    <div className="w-[260px] h-[55px] overflow-hidden">
                                        <svg ref={barcodeRef} className="w-[260px] h-[55px]" />
                                    </div>

                                    <div className="w-[260px] text-center mt-0 font-sans text-[11px] text-[#111]">
                                        {data.serialNumber || "GPI2026000001"}
                                    </div>
                                </div>

                                {/* CENTER: SCALLOPED GOLD SEAL */}
                                <div className="flex items-center justify-center">
                                    <div className="w-[112px] h-[112px] relative flex items-center justify-center bg-[repeating-conic-gradient(from_0deg,#a87513_0deg_5deg,#e0b64f_5deg_10deg)] [clip-path:polygon(50%_0%,57%_8%,66%_4%,71%_13%,81%_12%,84%_22%,94%_25%,92%_35%,100%_42%,94%_50%,100%_59%,92%_66%,94%_76%,84%_79%,81%_89%,71%_87%,66%_96%,57%_92%,50%_100%,43%_92%,34%_96%,29%_87%,19%_89%,16%_79%,6%_76%,8%_66%,0%_59%,6%_50%,0%_42%,8%_35%,6%_25%,16%_22%,19%_12%,29%_13%,34%_4%,43%_8%)]">
                                        <div className="w-[89px] h-[89px] flex items-center justify-center rounded-full bg-[#c69625] shadow-[inset_0_0_0_2px_#f2d681,inset_0_0_0_6px_#a8730c]">
                                            <div className="w-[70px] h-[70px] rounded-full flex flex-col items-center justify-center border border-[#f0d178] text-[#fff3bc] text-center">
                                                <div className="text-[16px] leading-none">🎓</div>
                                                <div className="mt-[1px] font-sans text-[21px] font-extrabold">GPI</div>
                                                <div className="mt-[1px] text-[12px]">★</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* RIGHT: SIGNATURE LINE */}
                                <div className="self-end text-center pl-[35px]">
                                    <div className="w-[250px] h-[1px] ml-auto bg-[#1b1b1b]" />
                                    <div className="mt-[6px] font-serif text-[13px] text-[#252525]">
                                        Instructor / Authorized Signature
                                    </div>
                                </div>
                            </section>

                            {/* FOOTER METADATA */}
                            <footer className="absolute left-[58px] right-[58px] bottom-[23px] h-[27px] flex items-center justify-center gap-5 z-[4] font-serif text-[13px] text-[#233450]">
                                <div className="flex items-center gap-[7px] whitespace-nowrap">
                                    <span className="text-[15px] text-[#172f55]">●</span>
                                    <span>Website: {data.website}</span>
                                </div>

                                <div className="w-[1px] h-[20px] bg-[#a9a9a9]" />

                                <div className="flex items-center gap-[7px] whitespace-nowrap">
                                    <span className="text-[15px] text-[#172f55]">✉</span>
                                    <span>Email: {data.email}</span>
                                </div>

                                <div className="w-[1px] h-[20px] bg-[#a9a9a9]" />

                                <div className="flex items-center gap-[7px] whitespace-nowrap">
                                    <span className="text-[15px] text-[#172f55]">☎</span>
                                    <span>Mobile: {data.mobile}</span>
                                </div>
                            </footer>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Date Formatters
function formatDay(date: string) {
    if (!date) return "____";
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return "____";
    return String(parsed.getDate()).padStart(2, "0");
}

function formatMonth(date: string) {
    if (!date) return "________";
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return "________";
    return parsed.toLocaleDateString("en-US", { month: "long" });
}

function formatYear(date: string) {
    if (!date) return "____";
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return "____";
    return parsed.getFullYear();
}

export default Certificate;
```

---

## 4. Pure Vanilla CSS & HTML Version

If you need pure CSS without Tailwind:

### CSS (`certificate.css`)

```css
.certificate-wrapper {
  width: min(100%, 1120px);
  aspect-ratio: 297 / 210;
  position: relative;
  flex-shrink: 0;
}

.certificate {
  width: 1120px;
  height: 792px;
  position: relative;
  background: #ffffff;
  transform-origin: top left;
  user-select: none;
  overflow: hidden;
}

.certificate-watermark {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 75%;
  height: 75%;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none;
  z-index: 1;
}

.watermark-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  opacity: 0.1;
}

.certificate-outer-border {
  position: absolute;
  inset: 0;
  padding: 10px;
  background: #102f52;
  border: 1px solid #0b2038;
}

.certificate-outer-border::before {
  content: "";
  position: absolute;
  inset: 4px;
  border: 2px solid #c99b3d;
  pointer-events: none;
}

.certificate-inner-border {
  width: 100%;
  height: 100%;
  position: relative;
  padding: 13px;
  background: #ffffff;
  border: 2px solid #c79b43;
}

.certificate-inner-border::before {
  content: "";
  position: absolute;
  inset: 5px;
  border: 1px solid #172e4e;
  pointer-events: none;
}

.certificate-content {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  background: radial-gradient(circle at center, rgba(224, 218, 198, 0.08), transparent 48%), #ffffff;
}

.corner-decoration {
  width: 70px;
  height: 70px;
  position: absolute;
  z-index: 5;
  color: #b48a43;
  font-family: Georgia, serif;
  font-size: 65px;
  line-height: 1;
  pointer-events: none;
}

.top-left { top: 7px; left: 8px; }
.top-left span { display: block; transform: rotate(-10deg); }
.top-right { top: 7px; right: 8px; transform: scaleX(-1); }
.top-right span { display: block; }
.bottom-left { bottom: 7px; left: 8px; transform: scaleY(-1); }
.bottom-left span { display: block; }
.bottom-right { right: 8px; bottom: 7px; transform: rotate(180deg); }
.bottom-right span { display: block; }

.certificate-header {
  position: relative;
  text-align: center;
  padding-top: 22px;
  z-index: 2;
}

.gpi-logo {
  width: 120px;
  height: 120px;
  margin: 0 auto 5px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.gpi-logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.institution-name {
  margin: 2px 0 0;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 29px;
  font-weight: 700;
  letter-spacing: 0.4px;
  color: #102e57;
}

.certificate-title {
  margin: 18px 0 2px;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 43px;
  line-height: 1.1;
  font-weight: 500;
  letter-spacing: 1px;
  color: #a87929;
}

.title-decoration {
  width: 180px;
  margin: 5px auto 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
}

.title-decoration span {
  height: 1px;
  flex: 1;
  background: #bd9144;
}

.title-decoration b {
  color: #bd9144;
  font-size: 14px;
}

.certificate-main {
  position: relative;
  z-index: 2;
  text-align: center;
  margin-top: 16px;
}

.certify-text {
  margin: 0;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 19px;
  color: #292929;
}

.student-name {
  min-height: 47px;
  margin: 9px auto 2px;
  width: 62%;
  padding: 0 10px 5px;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 30px;
  font-weight: 600;
  color: #17243a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.student-line {
  width: 63%;
  height: 1px;
  margin: 0 auto 15px;
  background: #1b1b1b;
}

.achievement-text, .conducted-text, .commendation-text {
  margin: 0;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 17px;
  color: #282828;
}

.conducted-text { margin-top: 8px; }
.commendation-text { margin-top: 10px; }

.examination-name {
  width: 55%;
  min-height: 33px;
  margin: 4px auto 0;
  padding-bottom: 3px;
  border-bottom: 1px solid #222;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 21px;
  font-weight: 600;
  color: #202020;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.award-date {
  margin: 14px 0 0;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 16px;
  color: #282828;
}

.award-date span {
  display: inline-block;
  min-width: 45px;
  padding: 0 5px 2px;
  border-bottom: 1px solid #444;
}

.certificate-bottom {
  position: absolute;
  left: 48px;
  right: 48px;
  bottom: 77px;
  height: 105px;
  display: grid;
  grid-template-columns: 1fr 160px 1fr;
  align-items: center;
  z-index: 3;
}

.serial-section { align-self: end; text-align: left; }
.serial-number { margin-bottom: 6px; font-family: Arial, sans-serif; font-size: 13px; font-weight: 500; color: #161616; }
.serial-number strong { font-weight: 750; }
.barcode-container { width: 260px; height: 55px; overflow: hidden; }
.barcode-label { width: 260px; text-align: center; margin-top: 0; font-family: Arial, sans-serif; font-size: 11px; color: #111; }

.seal-container { display: flex; align-items: center; justify-content: center; }
.certificate-seal {
  width: 112px;
  height: 112px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: repeating-conic-gradient(from 0deg, #a87513 0deg 5deg, #e0b64f 5deg 10deg);
  clip-path: polygon(50% 0%, 57% 8%, 66% 4%, 71% 13%, 81% 12%, 84% 22%, 94% 25%, 92% 35%, 100% 42%, 94% 50%, 100% 59%, 92% 66%, 94% 76%, 84% 79%, 81% 89%, 71% 87%, 66% 96%, 57% 92%, 50% 100%, 43% 92%, 34% 96%, 29% 87%, 19% 89%, 16% 79%, 6% 76%, 8% 66%, 0% 59%, 6% 50%, 0% 42%, 8% 35%, 6% 25%, 16% 22%, 19% 12%, 29% 13%, 34% 4%, 43% 8%);
}

.seal-ring {
  width: 89px;
  height: 89px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #c69625;
  box-shadow: inset 0 0 0 2px #f2d681, inset 0 0 0 6px #a8730c;
}

.seal-inner {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px solid #f0d178;
  color: #fff3bc;
  text-align: center;
}

.seal-cap { font-size: 16px; line-height: 1; }
.seal-gpi { margin-top: 1px; font-family: Arial, sans-serif; font-size: 21px; font-weight: 800; }
.seal-star { margin-top: 1px; font-size: 12px; }

.signature-section { align-self: end; text-align: center; padding-left: 35px; }
.signature-line { width: 250px; height: 1px; margin-left: auto; background: #1b1b1b; }
.signature-text { margin-top: 6px; font-family: Georgia, "Times New Roman", serif; font-size: 13px; color: #252525; }

.certificate-footer {
  position: absolute;
  left: 58px;
  right: 58px;
  bottom: 23px;
  height: 27px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  z-index: 4;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 13px;
  color: #233450;
}

.footer-item { display: flex; align-items: center; gap: 7px; white-space: nowrap; }
.footer-icon { font-size: 15px; color: #172f55; }
.footer-divider { width: 1px; height: 20px; background: #a9a9a9; }
```

---

## 5. High-Resolution PDF Export Utility (`html2canvas` + `jsPDF`)

Install packages:
```bash
npm install html2canvas jspdf
npm install -D @types/jspdf
```

Export function:
```ts
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export async function downloadCertificatePDF(
    elementId: string = "certificate",
    studentName: string = "Student",
    serialNumber: string = "GPI-PASS-2026-000001"
) {
    const certificateElement = document.getElementById(elementId);
    if (!certificateElement) {
        throw new Error(`Element with id "${elementId}" not found`);
    }

    // Wait 300ms for images and fonts to stabilize
    await new Promise((resolve) => setTimeout(resolve, 300));

    const canvas = await html2canvas(certificateElement, {
        scale: 3, // 3x scale produces 300+ DPI equivalent sharpness
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        logging: false,
        imageTimeout: 15000,
    });

    const imageData = canvas.toDataURL("image/png", 1.0);

    const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
        compress: true,
    });

    const pageWidth = 297;  // A4 Landscape width in mm
    const pageHeight = 210; // A4 Landscape height in mm

    pdf.addImage(
        imageData,
        "PNG",
        0,
        0,
        pageWidth,
        pageHeight,
        undefined,
        "FAST"
    );

    const safeName =
        studentName
            .trim()
            .replace(/[^a-zA-Z0-9\s-_]/g, "")
            .replace(/\s+/g, "_") || "Student";

    pdf.save(`Certificate_${safeName}_${serialNumber}.pdf`);
}
```

---

## 6. How to Use in Another Project

1. Copy the `Certificate.tsx` component into your components directory.
2. Place your institute logo in the `public/` folder (e.g. `public/gpilogo_icon.png`).
3. Ensure Tailwind CSS v3 or v4 is configured with support for arbitrary values (standard in both versions).
4. Add the PDF export handler to your download trigger.
