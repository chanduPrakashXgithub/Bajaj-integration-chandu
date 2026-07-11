const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/modals/detail/BranchDeepDiveScreen.tsx');
let content = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');

// Helper to replace precisely
function replaceExact(findStr, replaceStr) {
    if (content.indexOf(findStr) !== -1) {
        content = content.replace(findStr, replaceStr);
    } else {
        console.warn('NOT FOUND:', findStr.substring(0, 50) + '...');
    }
}

// renderOverview wrapper
replaceExact(
    '<View style={{ backgroundColor: colors.text, borderRadius: borderRadius["4xl"], padding: spacing["2xl"] }}>',
    '<Card variant="glass" style={{ marginBottom: spacing.xl }}>'
);
replaceExact(
    '        </View>\n\n        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.md }}>',
    '        </Card>\n\n        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.md }}>'
);
replaceExact(
    'backgroundColor: "rgba(255,255,255,0.1)"',
    'backgroundColor: colors.slate50'
);
replaceExact(
    'color: colors.slate300',
    'color: colors.textSecondary'
);

// Revenue & Footfall
replaceExact(
    '<View style={{ backgroundColor: colors.card, borderRadius: borderRadius["4xl"], padding: spacing["2xl"], borderWidth: 1, borderColor: colors.border }}>\n          <Text style={{ fontSize: fontSize.lg, fontWeight: "600", color: colors.text, marginBottom: spacing.lg }}>Revenue & Footfall</Text>',
    '<Card variant="glass" style={{ marginBottom: spacing.xl }}>\n          <Text style={{ fontSize: fontSize.lg, fontWeight: "600", color: colors.text, marginBottom: spacing.lg }}>Revenue & Footfall</Text>'
);
replaceExact(
    '</View>\n        </View>\n\n        <View style={{ backgroundColor: colors.card, borderRadius: borderRadius["4xl"], padding: spacing["2xl"], borderWidth: 1, borderColor: colors.border }}>\n          <Text style={{ fontSize: fontSize.lg, fontWeight: "600", color: colors.text, marginBottom: spacing.lg }}>Budget Tracker</Text>',
    '</View>\n        </Card>\n\n        <Card variant="glass" style={{ marginBottom: spacing.xl }}>\n          <Text style={{ fontSize: fontSize.lg, fontWeight: "600", color: colors.text, marginBottom: spacing.lg }}>Budget Tracker</Text>'
);
replaceExact(
    'remaining</Text>\n        </View>\n      </>',
    'remaining</Text>\n        </Card>\n      </>'
);

// renderStaff
replaceExact(
    '<View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.md, marginBottom: spacing.md }}>\n          <View style={{ flex: 1, minWidth: 80, backgroundColor: colors.card, borderRadius: borderRadius["2xl"], padding: spacing.lg, alignItems: "center", borderWidth: 1, borderColor: colors.border }}>',
    '<Card variant="glass" style={{ marginBottom: spacing.xl }}>\n          <Text style={{ fontSize: fontSize.lg, fontWeight: "600", color: colors.text, marginBottom: spacing.lg }}>Staff Overview</Text>\n          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.md, marginBottom: spacing.md }}>\n          <View style={{ flex: 1, minWidth: 80, backgroundColor: colors.slate50, borderRadius: borderRadius["2xl"], padding: spacing.lg, alignItems: "center" }}>'
);
content = content.replace(/backgroundColor: colors\.card, borderRadius: borderRadius\["2xl"\], padding: spacing\.lg, alignItems: "center", borderWidth: 1, borderColor: colors\.border/g, 'backgroundColor: colors.slate50, borderRadius: borderRadius["2xl"], padding: spacing.lg, alignItems: "center"');
replaceExact(
    '</View>\n\n        <View style={{ gap: spacing.md }}>\n          {allStaff.length === 0 ? (',
    '</View>\n        </Card>\n\n        <Card variant="glass" style={{ marginBottom: spacing.xl }}>\n          <Text style={{ fontSize: fontSize.lg, fontWeight: "600", color: colors.text, marginBottom: spacing.lg }}>Staff Directory</Text>\n          <View style={{ gap: spacing.md }}>\n          {allStaff.length === 0 ? ('
);
content = content.replace(/<TouchableOpacity key=\{user\.id\} onPress=\{\(\) => setSelectedUserId\(user\.id\)\} activeOpacity=\{0\.7\} style=\{\{ backgroundColor: colors\.card, borderRadius: borderRadius\["2xl"\], padding: spacing\.xl, borderWidth: 1, borderColor: colors\.border \}\}>/g, '<TouchableOpacity key={user.id} onPress={() => setSelectedUserId(user.id)} activeOpacity={0.7} style={{ backgroundColor: colors.slate50, borderRadius: borderRadius["2xl"], padding: spacing.xl }}>');
replaceExact(
    '</TouchableOpacity>\n            );\n          })}\n        </View>\n      </>',
    '</TouchableOpacity>\n            );\n          })}\n        </View>\n      </Card>\n      </>'
);

// renderAppliances
replaceExact(
    'return (\n      <View style={{ gap: spacing.md }}>\n        {criticalAppliances > 0 && (',
    'return (\n      <Card variant="glass" style={{ marginBottom: spacing.xl }}>\n        <Text style={{ fontSize: fontSize.lg, fontWeight: "600", color: colors.text, marginBottom: spacing.lg }}>Appliances</Text>\n        <View style={{ gap: spacing.md }}>\n        {criticalAppliances > 0 && ('
);
content = content.replace(/<TouchableOpacity \n            key=\{app\.id\} \n            onPress=\{\(\) => openApplianceDetail\(app\.id\)\}\n            activeOpacity=\{0\.7\}\n            style=\{\{ backgroundColor: colors\.card, borderRadius: borderRadius\["2xl"\], padding: spacing\.xl, borderWidth: 1, borderColor: colors\.border \}\}\n          >/g, '<TouchableOpacity \n            key={app.id} \n            onPress={() => openApplianceDetail(app.id)}\n            activeOpacity={0.7}\n            style={{ backgroundColor: colors.slate50, borderRadius: borderRadius["2xl"], padding: spacing.xl }}\n          >');
replaceExact(
    '          </TouchableOpacity>\n        )})}\n      </View>\n    );\n  }',
    '          </TouchableOpacity>\n        )})}\n      </View>\n      </Card>\n    );\n  }'
);

// renderIssues
replaceExact(
    'return (\n      <View style={{ gap: spacing.md }}>\n        {openComplaints === 0 ? (',
    'return (\n      <Card variant="glass" style={{ marginBottom: spacing.xl }}>\n        <Text style={{ fontSize: fontSize.lg, fontWeight: "600", color: colors.text, marginBottom: spacing.lg }}>Open Issues</Text>\n        <View style={{ gap: spacing.md }}>\n        {openComplaints === 0 ? ('
);
content = content.replace(/<View key=\{c\.id\} style=\{\{ backgroundColor: colors\.card, borderRadius: borderRadius\["2xl"\], padding: spacing\.xl, borderWidth: 1, borderColor: colors\.border \}\}>/g, '<View key={c.id} style={{ backgroundColor: colors.slate50, borderRadius: borderRadius["2xl"], padding: spacing.xl }}>');
replaceExact(
    '            </View>\n          </View>\n        ))}\n      </View>\n    );\n  }',
    '            </View>\n          </View>\n        ))}\n      </View>\n      </Card>\n    );\n  }'
);

// renderInfo
replaceExact(
    '<View style={{ backgroundColor: colors.card, borderRadius: borderRadius["4xl"], padding: spacing["2xl"], borderWidth: 1, borderColor: colors.border }}>\n          <Text style={{ fontSize: fontSize.lg, fontWeight: "600", color: colors.text, marginBottom: spacing.lg }}>Branch Details</Text>',
    '<Card variant="glass" style={{ marginBottom: spacing.xl }}>\n          <Text style={{ fontSize: fontSize.lg, fontWeight: "600", color: colors.text, marginBottom: spacing.lg }}>Branch Details</Text>'
);
replaceExact(
    '</View>\n        </View>\n\n        <View style={{ backgroundColor: colors.card, borderRadius: borderRadius["4xl"], padding: spacing["2xl"], borderWidth: 1, borderColor: colors.border }}>\n          <Text style={{ fontSize: fontSize.lg, fontWeight: "600", color: colors.text, marginBottom: spacing.lg }}>Key Staff Assignments</Text>',
    '</View>\n        </Card>\n\n        <Card variant="glass" style={{ marginBottom: spacing.xl }}>\n          <Text style={{ fontSize: fontSize.lg, fontWeight: "600", color: colors.text, marginBottom: spacing.lg }}>Key Staff Assignments</Text>'
);
replaceExact(
    '</View>\n        </View>\n\n        <View style={{ backgroundColor: colors.card, borderRadius: borderRadius["4xl"], padding: spacing["2xl"], borderWidth: 1, borderColor: colors.border }}>\n          <Text style={{ fontSize: fontSize.lg, fontWeight: "600", color: colors.text, marginBottom: spacing.lg }}>Operations</Text>',
    '</View>\n        </Card>\n\n        <Card variant="glass" style={{ marginBottom: spacing.xl }}>\n          <Text style={{ fontSize: fontSize.lg, fontWeight: "600", color: colors.text, marginBottom: spacing.lg }}>Operations</Text>'
);
replaceExact(
    '</View>\n        </View>\n\n        {branch.recentActivity && branch.recentActivity.length > 0 && (\n          <View style={{ backgroundColor: colors.card, borderRadius: borderRadius["4xl"], padding: spacing["2xl"], borderWidth: 1, borderColor: colors.border }}>',
    '</View>\n        </Card>\n\n        {branch.recentActivity && branch.recentActivity.length > 0 && (\n          <Card variant="glass" style={{ marginBottom: spacing.xl }}>'
);
replaceExact(
    '</View>\n            </View>\n          </View>\n        )}\n      </View>\n    );\n  }',
    '</View>\n            </View>\n          </Card>\n        )}\n      </View>\n    );\n  }'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Done rewriting.');
