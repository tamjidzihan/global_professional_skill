export type CertificateTemplateId = 'template_1' | 'template_2' | 'template_3' | 'template_4';

export type EligibilityStatus = 'NOT_COMPLETED' | 'QUIZ_NOT_PASSED' | 'ELIGIBLE' | 'ISSUED';

export const GPI_CERTIFICATE_CONSTANTS = {
    WEBSITE: 'www.gpibd.com',
    EMAIL: 'info@gpibd.com',
    MOBILE: '+88 01978-100105',
    POWERED_BY: 'Powered by : Global Professional Institute',
    ORGANIZATION_NAME: 'Global Professional Institute',
} as const;

export interface CertificateData {
    studentName: string;
    courseName: string;
    organizationName?: string;
    certificateNumber?: string;
    issueDate?: string; // YYYY-MM-DD
    templateId?: CertificateTemplateId;
    authorizerName?: string;
    authorizerPosition?: string;
    signatureUrl?: string | null;
    signatureSize?: number; // scale percentage (e.g. 100 = 100%)
    enableAdditionalAuthorizer?: boolean;
    additionalAuthorizerName?: string;
    additionalAuthorizerPosition?: string;
    additionalSignatureUrl?: string | null;
    additionalSignatureSize?: number;
    logoUrl?: string | null;
    logoSize?: number; // scale percentage (e.g. 100 = 100%)
    verificationUrl?: string;
    website?: string;
    email?: string;
    mobile?: string;
}

export interface CourseCertificateConfig {
    id: string;
    course: string;
    course_title?: string;
    is_active: boolean;
    template_id: CertificateTemplateId;
    organization_name: string;
    logo_image?: string | null;
    logo_size?: number;
    logo_url?: string | null;
    authorizer_name: string;
    authorizer_position: string;
    signature_image?: string | null;
    signature_size?: number;
    signature_url?: string | null;
    enable_additional_authorizer?: boolean;
    additional_authorizer_name?: string;
    additional_authorizer_position?: string;
    additional_signature_image?: string | null;
    additional_signature_size?: number;
    additional_signature_url?: string | null;
    created_at?: string;
    updated_at?: string;
    created_by_name?: string;
}

export interface CertificateCandidate {
    enrollment_id: string;
    student_id: string;
    student_name: string;
    student_email: string;
    student_phone?: string;
    organization_name?: string;
    employee_id?: string;
    progress_percentage: number;
    course_completed: boolean;
    total_quizzes: number;
    completed_quizzes: number;
    average_quiz_score: number;
    quiz_pass_threshold: number;
    quiz_passed: boolean;
    eligibility_status: EligibilityStatus;
    reason?: string;
    certificate?: CertificateRecord | null;
}

export interface CertificateRecord {
    id: string;
    enrollment?: string;
    certificate_number: string;
    status: 'ISSUED' | 'REVOKED';
    student_id?: string;
    student_email?: string;
    student_name: string;
    course_id?: string;
    course_name: string;
    organization_name: string;
    template_id: CertificateTemplateId;
    logo_image?: string | null;
    logo_size?: number;
    logo_url?: string | null;
    authorizer_name: string;
    authorizer_position: string;
    signature_image?: string | null;
    signature_size?: number;
    signature_url?: string | null;
    enable_additional_authorizer?: boolean;
    additional_authorizer_name?: string;
    additional_authorizer_position?: string;
    additional_signature_image?: string | null;
    additional_signature_size?: number;
    additional_signature_url?: string | null;
    issue_date: string;
    issued_at: string;
    verification_url: string;
    revoked_at?: string | null;
    revocation_reason?: string;
}

export interface PublicVerificationResult {
    valid: boolean;
    certificate_number: string;
    student_name: string;
    course_name: string;
    organization_name: string;
    issue_date: string;
    status: 'VALID' | 'REVOKED';
    template_id: CertificateTemplateId;
    authorizer_name?: string;
    authorizer_position?: string;
    has_signature: boolean;
    signature_url?: string | null;
    signature_size?: number;
    enable_additional_authorizer?: boolean;
    additional_authorizer_name?: string;
    additional_authorizer_position?: string;
    has_additional_signature?: boolean;
    additional_signature_url?: string | null;
    additional_signature_size?: number;
    logo_url?: string | null;
    logo_size?: number;
    issued_at: string;
    verification_url: string;
}

export interface StudentCertificateEnrollment {
    enrollment_id: string;
    course: {
        id: string;
        title: string;
        slug: string;
        thumbnail?: string | null;
        instructor_name?: string;
    };
    progress_percentage: number;
    course_completed: boolean;
    average_quiz_score: number;
    quiz_pass_threshold: number;
    quiz_passed: boolean;
    eligibility_status: EligibilityStatus;
    status_message: string;
    certificate?: CertificateRecord | null;
}

