import Link from "next/link"

const quickLinks = [
	{
		title: "Platform",
		items: [
			{ label: "About Opportunet", href: "/mission" },
			{ label: "Governance & Security", href: "/resources/policy" },
			{ label: "Roadmap & Updates", href: "/resources" },
			{ label: "Help & Support", href: "/support" },
			{ label: "Accessibility", href: "/resources/accessibility" },
		],
	},
	{
		title: "For Institutions",
		items: [
			{ label: "Placement Cell workspace", href: "/(app)/post-jobs" },
			{ label: "Faculty coordination", href: "/(app)/approvals" },
			{ label: "Drive orchestration", href: "/(app)/dashboard" },
			{ label: "Reporting & analytics", href: "/(app)/analytics" },
			{ label: "Onboarding guide", href: "/resources#onboard" },
		],
	},
	{
		title: "For Employers",
		items: [
			{ label: "Post a role", href: "/(app)/post-jobs" },
			{ label: "View applications", href: "/(app)/applications" },
			{ label: "Shortlist & interview", href: "/(app)/interviews" },
			{ label: "Offer governance", href: "/(app)/approvals" },
			{ label: "API & bulk posting", href: "/resources#api" },
		],
	},
]

const contact = {
	title: "Mission Desk",
	lines: [
		"National Internship & Placement Mission",
		"Department of Higher Education, Government of India",
		"Shastri Bhawan, New Delhi - 110001",
	],
	phone: "+91 011 4000 1122",
	email: "support@opportunet.gov.in",
}

export default function Footer() {
	return (
		<footer className="mt-12 border-t border-sky-700 bg-gradient-to-br from-sky-900 via-sky-800 to-sky-900 text-white">
			<div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-12 lg:flex-row lg:gap-12">
				<div className="grid flex-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
					{quickLinks.map((group) => (
						<div key={group.title} className="space-y-3">
							<h3 className="text-base font-semibold text-white">{group.title}</h3>
							<ul className="space-y-2 text-sm text-slate-100">
								{group.items.map((item) => (
									<li key={item.label}>
										<Link href={item.href} className="text-slate-100 hover:text-white">
											{item.label}
										</Link>
									</li>
								))}
							</ul>
						</div>
					))}
				</div>

				<div className="w-full max-w-sm space-y-3 rounded-2xl border border-sky-700/60 bg-white/10 p-6 text-sm shadow-sm backdrop-blur">
					<h3 className="text-base font-semibold text-white">{contact.title}</h3>
					<div className="space-y-2 text-slate-100">
						{contact.lines.map((line) => (
							<p key={line}>{line}</p>
						))}
					</div>
					<div className="space-y-1 text-slate-100">
						<p className="font-semibold text-white">{contact.phone}</p>
						<p className="text-sky-100">{contact.email}</p>
					</div>
				</div>
			</div>

			<div className="border-t border-sky-800/70">
				<div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 text-xs text-slate-100">
					<div className="flex flex-wrap gap-4">
						<Link href="#" className="text-slate-100 hover:text-white">Students</Link>
						<Link href="#" className="text-slate-100 hover:text-white">Faculty & Staff</Link>
						<Link href="#" className="text-slate-100 hover:text-white">Alumni</Link>
						<Link href="#" className="text-slate-100 hover:text-white">Telephone Directory</Link>
					</div>
					<p className="text-slate-200">© {new Date().getFullYear()} Opportunet — National internship & Placement Mission</p>
				</div>
			</div>
		</footer>
	)
}
