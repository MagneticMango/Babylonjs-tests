{
  description = "BabylonJS TypeScript webpack starter";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

  outputs = { self, nixpkgs }:
    let
      systems = [ "x86_64-linux" "aarch64-linux" "x86_64-darwin" "aarch64-darwin" ];
      forAllSystems = f: nixpkgs.lib.genAttrs systems (system: f nixpkgs.legacyPackages.${system});
    in
    {
      devShells = forAllSystems (pkgs: {
        default = pkgs.mkShell {
          packages = [
            pkgs.nodejs_24
          ] ++ pkgs.lib.optionals pkgs.stdenv.hostPlatform.isLinux [
            # headless browser for smoke-testing the scene
            pkgs.chromium
          ];
        };
      });
    };
}
