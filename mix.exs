defmodule VideoRoom.MixProject do
  use Mix.Project

  def project do
    [
      app: :membrane_videoroom_demo,
      version: "0.1.0",
      elixir: "~> 1.12",
      aliases: aliases(),
      start_permanent: Mix.env() == :prod,
      deps: deps()
    ]
  end

  def application do
    [
      mod: {VideoRoom.Application, []},
      extra_applications: [:logger]
    ]
  end

  defp deps do
    [
      {:membrane_rtc_engine,
       github: "membraneframework/membrane_rtc_engine", branch: "remove-fir-interval"},
      # {:membrane_rtc_engine, github: "membraneframework/membrane_rtc_engine"},
      # {:membrane_rtc_engine, "~> 0.4.0"},
      # {:membrane_rtp_plugin,
      #  github: "membraneframework/membrane_rtp_plugin",
      #  branch: "feat/bandwidth-est-stats",
      #  override: true},
      # # {:membrane_rtp_plugin, path: "../membrane_rtp_plugin", override: true},
      # {:membrane_webrtc_plugin,
      #  github: "membraneframework/membrane_webrtc_plugin",
      #  branch: "feat/bandwidth-est-stats",
      #  override: true},
      # {:membrane_webrtc_plugin, path: "../membrane_webrtc_plugin", override: true},
      {:plug_cowboy, "~> 2.5.2"},
      {:phoenix, "~> 1.6"},
      {:phoenix_html, "~> 3.0"},
      {:phoenix_live_view, "~> 0.16.0"},
      {:phoenix_live_reload, "~> 1.2"},
      {:jason, "~> 1.2"},
      {:phoenix_inline_svg, "~> 1.4"},
      {:uuid, "~> 1.1"},
      {:esbuild, "~> 0.4", runtime: Mix.env() == :dev},
      {:cowlib, "~> 2.11.0", override: true},

      # Otel
      {:opentelemetry, "~> 1.0", override: true},
      {:opentelemetry_api, "~> 1.0", override: true},
      {:opentelemetry_exporter, "~> 1.0", override: true},
      {:opentelemetry_zipkin, "~> 1.0", override: true},

      # Benchmarks
      {:beamchmark, "~> 0.1.0", only: :benchmark},
      {:stampede, github: "geometerio/stampede-elixir", only: :benchmark},
      {:httpoison, "~> 1.8", only: :benchmark},
      {:poison, "~> 5.0.0", only: :benchmark},

      # File_endpoint
      {:membrane_realtimer_plugin, "~> 0.5.0"}
    ]
  end

  defp aliases do
    [
      setup: ["deps.get", "cmd --cd assets npm ci"],
      "assets.deploy": [
        "cmd --cd assets npm run deploy",
        "esbuild default --minify",
        "phx.digest"
      ]
    ]
  end
end
