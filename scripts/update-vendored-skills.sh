#!/usr/bin/env bash
# Kéo bản mới nhất của hai skill ngoài về .claude/skills/.
# Nguồn và giấy phép: xem .claude/skills/README.md
set -euo pipefail

repo_root=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT

sync_skill() {
  local url=$1 upstream_path=$2 dest=$3 name
  name=$(basename "$dest")

  git clone --depth 1 --quiet "$url" "$work/$name"

  if [ ! -f "$work/$name/$upstream_path" ]; then
    echo "LỖI: thượng nguồn không còn $upstream_path — kiểm tra lại $url" >&2
    exit 1
  fi

  mkdir -p "$dest"
  cp "$work/$name/$upstream_path" "$dest/SKILL.md"
  printf '%-22s %s\n' "$name" "$(git -C "$work/$name" rev-parse HEAD)"
}

echo "Commit thượng nguồn sau khi cập nhật:"
sync_skill https://github.com/JuliusBrussee/caveman.git \
  skills/caveman/SKILL.md "$repo_root/.claude/skills/caveman"
sync_skill https://github.com/multica-ai/andrej-karpathy-skills.git \
  skills/karpathy-guidelines/SKILL.md "$repo_root/.claude/skills/karpathy-guidelines"

cp "$work/caveman/LICENSE" "$repo_root/.claude/skills/caveman/LICENSE"

echo
echo "Cập nhật lại cột 'Commit ghim' trong .claude/skills/README.md rồi commit."
git -C "$repo_root" status --short .claude/skills
