import re

file_path = 'src/modals/detail/BranchDeepDiveScreen.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add Card import
if 'import { Card }' not in content:
    content = content.replace('import { Badge }', 'import { Card } from "../../shared/components/Card";\nimport { Badge }')

# 2. Fix inline arrays to avoid TS infinite recursion
content = re.sub(r'(\[\s*\{\s*label:\s*"Health"[\s\S]*?\}\s*\])\.map', r'(\1 as any[]).map', content)
content = re.sub(r'(\[\s*\{\s*label:\s*"Staff"[\s\S]*?\}\s*\])\.map', r'(\1 as any[]).map', content)
content = re.sub(r'(\[\s*\{\s*label:\s*"Revenue Index"[\s\S]*?\}\s*\])\.map', r'(\1 as any[]).map', content)

# 3. Replace all main sections with Card variant="glass"
def replace_section(content, original_start, replacement_start, original_end, replacement_end):
    content = content.replace(original_start, replacement_start)
    content = content.replace(original_end, replacement_end)
    return content

# renderOverview main wrapper
content = replace_section(content,
    '<View style={{ backgroundColor: colors.text, borderRadius: borderRadius["4xl"], padding: spacing["2xl"] }}>',
    '<Card variant="glass" style={{ marginBottom: spacing.xl }}>',
    '        </View>\n\n        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.md }}>',
    '        </Card>\n\n        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.md }}>'
)

# renderOverview inner cards text color fix
content = content.replace(
    'backgroundColor: "rgba(255,255,255,0.1)"',
    'backgroundColor: colors.slate50'
)
content = content.replace(
    'color: colors.slate300',
    'color: colors.textSecondary'
)

# Revenue & Footfall
content = replace_section(content,
    '<View style={{ backgroundColor: colors.card, borderRadius: borderRadius["4xl"], padding: spacing["2xl"], borderWidth: 1, borderColor: colors.border }}>\n          <Text style={{ fontSize: fontSize.lg, fontWeight: "600", color: colors.text, marginBottom: spacing.lg }}>Revenue & Footfall</Text>',
    '<Card variant="glass" style={{ marginBottom: spacing.xl }}>\n          <Text style={{ fontSize: fontSize.lg, fontWeight: "600", color: colors.text, marginBottom: spacing.lg }}>Revenue & Footfall</Text>',
    '</View>\n        </View>\n\n        <View style={{ backgroundColor: colors.card, borderRadius: borderRadius["4xl"]',
    '</View>\n        </Card>\n\n        <View style={{ backgroundColor: colors.card, borderRadius: borderRadius["4xl"]'
)

# Budget Tracker
content = replace_section(content,
    '<View style={{ backgroundColor: colors.card, borderRadius: borderRadius["4xl"], padding: spacing["2xl"], borderWidth: 1, borderColor: colors.border }}>\n          <Text style={{ fontSize: fontSize.lg, fontWeight: "600", color: colors.text, marginBottom: spacing.lg }}>Budget Tracker</Text>',
    '<Card variant="glass" style={{ marginBottom: spacing.xl }}>\n          <Text style={{ fontSize: fontSize.lg, fontWeight: "600", color: colors.text, marginBottom: spacing.lg }}>Budget Tracker</Text>',
    'remaining</Text>\n        </View>\n      </>',
    'remaining</Text>\n        </Card>\n      </>'
)

# renderStaff
content = content.replace(
    '<View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.md, marginBottom: spacing.md }}>\n          <View style={{ flex: 1, minWidth: 80, backgroundColor: colors.card, borderRadius: borderRadius["2xl"], padding: spacing.lg, alignItems: "center", borderWidth: 1, borderColor: colors.border }}>',
    '<Card variant="glass" style={{ marginBottom: spacing.xl }}>\n          <Text style={{ fontSize: fontSize.lg, fontWeight: "600", color: colors.text, marginBottom: spacing.lg }}>Staff Overview</Text>\n          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.md, marginBottom: spacing.md }}>\n          <View style={{ flex: 1, minWidth: 80, backgroundColor: colors.slate50, borderRadius: borderRadius["2xl"], padding: spacing.lg, alignItems: "center" }}>'
)
# Update remaining inner staff cards
content = content.replace(
    'backgroundColor: colors.card, borderRadius: borderRadius["2xl"], padding: spacing.lg, alignItems: "center", borderWidth: 1, borderColor: colors.border',
    'backgroundColor: colors.slate50, borderRadius: borderRadius["2xl"], padding: spacing.lg, alignItems: "center"'
)
content = content.replace(
    '</View>\n\n        <View style={{ gap: spacing.md }}>\n          {allStaff.length === 0 ? (',
    '</View>\n        </Card>\n\n        <Card variant="glass" style={{ marginBottom: spacing.xl }}>\n          <Text style={{ fontSize: fontSize.lg, fontWeight: "600", color: colors.text, marginBottom: spacing.lg }}>Staff Directory</Text>\n          <View style={{ gap: spacing.md }}>\n          {allStaff.length === 0 ? ('
)
content = content.replace(
    '<TouchableOpacity key={user.id} onPress={() => setSelectedUserId(user.id)} activeOpacity={0.7} style={{ backgroundColor: colors.card, borderRadius: borderRadius["2xl"], padding: spacing.xl, borderWidth: 1, borderColor: colors.border }}>',
    '<TouchableOpacity key={user.id} onPress={() => setSelectedUserId(user.id)} activeOpacity={0.7} style={{ backgroundColor: colors.slate50, borderRadius: borderRadius["2xl"], padding: spacing.xl }}>'
)
content = content.replace(
    '</TouchableOpacity>\n            );\n          })}\n        </View>\n      </>',
    '</TouchableOpacity>\n            );\n          })}\n        </View>\n      </Card>\n      </>'
)

# renderAppliances
content = content.replace(
    'return (\n      <View style={{ gap: spacing.md }}>\n        {criticalAppliances > 0 && (',
    'return (\n      <Card variant="glass" style={{ marginBottom: spacing.xl }}>\n        <Text style={{ fontSize: fontSize.lg, fontWeight: "600", color: colors.text, marginBottom: spacing.lg }}>Appliances</Text>\n        <View style={{ gap: spacing.md }}>\n        {criticalAppliances > 0 && ('
)
content = content.replace(
    'return (\n          <TouchableOpacity \n            key={app.id} \n            onPress={() => openApplianceDetail(app.id)}\n            activeOpacity={0.7}\n            style={{ backgroundColor: colors.card, borderRadius: borderRadius["2xl"], padding: spacing.xl, borderWidth: 1, borderColor: colors.border }}\n          >',
    'return (\n          <TouchableOpacity \n            key={app.id} \n            onPress={() => openApplianceDetail(app.id)}\n            activeOpacity={0.7}\n            style={{ backgroundColor: colors.slate50, borderRadius: borderRadius["2xl"], padding: spacing.xl }}\n          >'
)
content = content.replace(
    '</TouchableOpacity>\n          );\n        })}\n      </View>\n    );\n  }',
    '</TouchableOpacity>\n          );\n        })}\n      </View>\n      </Card>\n    );\n  }'
)

# renderIssues
content = content.replace(
    'return (\n      <View style={{ gap: spacing.md }}>\n        {openComplaints === 0 ? (',
    'return (\n      <Card variant="glass" style={{ marginBottom: spacing.xl }}>\n        <Text style={{ fontSize: fontSize.lg, fontWeight: "600", color: colors.text, marginBottom: spacing.lg }}>Open Issues</Text>\n        <View style={{ gap: spacing.md }}>\n        {openComplaints === 0 ? ('
)
content = content.replace(
    '<View key={c.id} style={{ backgroundColor: colors.card, borderRadius: borderRadius["2xl"], padding: spacing.xl, borderWidth: 1, borderColor: colors.border }}>',
    '<View key={c.id} style={{ backgroundColor: colors.slate50, borderRadius: borderRadius["2xl"], padding: spacing.xl }}>'
)
content = content.replace(
    '</ProgressBar>\n            </View>\n          </View>\n        ))}\n      </View>\n    );\n  }',
    '</ProgressBar>\n            </View>\n          </View>\n        ))}\n      </View>\n      </Card>\n    );\n  }'
)
content = content.replace(
    'height={6} />\n            </View>\n          </View>\n        ))}\n      </View>\n    );\n  }',
    'height={6} />\n            </View>\n          </View>\n        ))}\n      </View>\n      </Card>\n    );\n  }'
)

# renderInfo
content = replace_section(content,
    '<View style={{ backgroundColor: colors.card, borderRadius: borderRadius["4xl"], padding: spacing["2xl"], borderWidth: 1, borderColor: colors.border }}>\n          <Text style={{ fontSize: fontSize.lg, fontWeight: "600", color: colors.text, marginBottom: spacing.lg }}>Branch Details</Text>',
    '<Card variant="glass" style={{ marginBottom: spacing.xl }}>\n          <Text style={{ fontSize: fontSize.lg, fontWeight: "600", color: colors.text, marginBottom: spacing.lg }}>Branch Details</Text>',
    '</View>\n        </View>\n\n        <View style={{ backgroundColor: colors.card, borderRadius: borderRadius["4xl"], padding: spacing["2xl"], borderWidth: 1, borderColor: colors.border }}>\n          <Text style={{ fontSize: fontSize.lg, fontWeight: "600", color: colors.text, marginBottom: spacing.lg }}>Key Staff Assignments</Text>',
    '</View>\n        </Card>\n\n        <Card variant="glass" style={{ marginBottom: spacing.xl }}>\n          <Text style={{ fontSize: fontSize.lg, fontWeight: "600", color: colors.text, marginBottom: spacing.lg }}>Key Staff Assignments</Text>'
)
content = content.replace(
    '</View>\n        </View>\n\n        <View style={{ backgroundColor: colors.card, borderRadius: borderRadius["4xl"], padding: spacing["2xl"], borderWidth: 1, borderColor: colors.border }}>\n          <Text style={{ fontSize: fontSize.lg, fontWeight: "600", color: colors.text, marginBottom: spacing.lg }}>Operations</Text>',
    '</View>\n        </Card>\n\n        <Card variant="glass" style={{ marginBottom: spacing.xl }}>\n          <Text style={{ fontSize: fontSize.lg, fontWeight: "600", color: colors.text, marginBottom: spacing.lg }}>Operations</Text>'
)
content = content.replace(
    '</View>\n        </View>\n\n        {branch.recentActivity && branch.recentActivity.length > 0 && (\n          <View style={{ backgroundColor: colors.card, borderRadius: borderRadius["4xl"], padding: spacing["2xl"], borderWidth: 1, borderColor: colors.border }}>',
    '</View>\n        </Card>\n\n        {branch.recentActivity && branch.recentActivity.length > 0 && (\n          <Card variant="glass" style={{ marginBottom: spacing.xl }}>'
)
content = content.replace(
    '</View>\n            </View>\n          </View>\n        )}\n      </View>\n    );\n  }',
    '</View>\n            </View>\n          </Card>\n        )}\n      </View>\n    );\n  }'
)


with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Python script executed successfully.")
