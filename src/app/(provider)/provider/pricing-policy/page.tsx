import { FeaturePlaceholder } from '@/shared/components/FeaturePlaceholder'
import { PageHeader } from '@/shared/components/PageHeader'

export default function PricingPolicyPage() {
  return (
    <>
          <PageHeader
            eyebrow="Provider workspace"
            title="Pricing Policy"
            description="Monitor your pricing policy in special dates or events."
          />
          <FeaturePlaceholder
            items={[
              "Pricing on holidays or special events",
              "Active sales or promotions",
              "Monthly performance",
            ]}
          />
        </>
  )
}
