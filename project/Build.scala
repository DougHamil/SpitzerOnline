import sbt._
import Keys._
import play.Project._

object ApplicationBuild extends Build {

  val appName         = "Spitzer"
  val appVersion      = "1.0-SNAPSHOT"

  val appDependencies = Seq(
    // Add your project dependencies here,
    javaCore,
    javaJdbc,
    javaEbean,
    "com.google.guava" % "guava" % "12.0",
    "mysql" % "mysql-connector-java" % "5.1.18"
  )

  val main = play.Project(appName, appVersion, appDependencies).settings(
    // Add your own project settings here      
  )

}
